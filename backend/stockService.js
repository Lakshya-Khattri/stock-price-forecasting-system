const { spawn } = require('child_process');
const path = require('path');
const { AppError } = require('./errorHandler');

const ML_SCRIPT = path.join(__dirname, 'mlService.py');
const PYTHON_CMD = process.env.PYTHON_CMD || 'python3';
const TIMEOUT_MS = 120_000;

/**
 * Runs Python ML script safely and returns parsed JSON.
 */
function runMLService(ticker) {
  return new Promise((resolve, reject) => {
    const cleanTicker = ticker.trim().toUpperCase();

    const proc = spawn(PYTHON_CMD, [ML_SCRIPT, cleanTicker], {
      env: { ...process.env, PYTHONUNBUFFERED: '1' },
    });

    let stdout = '';
    let stderr = '';

    const timeout = setTimeout(() => {
      proc.kill();
      reject(new AppError(`ML prediction timed out for ticker: ${cleanTicker}`, 504));
    }, TIMEOUT_MS);

    proc.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    proc.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    proc.on('close', (code) => {
      clearTimeout(timeout);

      if (code !== 0) {
        console.error(`[mlService] Python stderr for ${cleanTicker}:\n${stderr}`);
        const msg = extractPythonError(stderr) || `ML script failed for ${cleanTicker}`;
        return reject(new AppError(msg, 422));
      }

      try {
        // Ensure we only parse valid JSON line
        const cleanedOutput = stdout.trim();

        if (!cleanedOutput) {
          return reject(new AppError(`Empty ML response for ${cleanTicker}`, 500));
        }

        const result = JSON.parse(cleanedOutput);

        if (result.error) {
          return reject(new AppError(result.error, 422));
        }

        resolve(result);

      } catch (err) {
        console.error(`[mlService] Failed JSON parse for ${cleanTicker}`);
        console.error("Raw stdout:\n", stdout);
        reject(new AppError(`Failed to parse ML output for ${cleanTicker}`, 500));
      }
    });

    proc.on('error', (err) => {
      clearTimeout(timeout);
      reject(new AppError(`Failed to start Python process: ${err.message}`, 500));
    });
  });
}

function extractPythonError(stderr) {
  if (!stderr) return null;
  const lines = stderr.trim().split('\n');
  const lastLine = lines[lines.length - 1];
  return lastLine && lastLine.length < 300 ? lastLine : null;
}

/**
 * Fetch predictions for multiple tickers safely.
 */
async function getPredictions(tickers) {
  const cleanTickers = tickers
    .map(t => t.trim().toUpperCase())
    .filter(Boolean);

  const results = await Promise.allSettled(
    cleanTickers.map(ticker => runMLService(ticker))
  );

  return results.map((result, i) => {
    if (result.status === 'fulfilled') {
      return result.value;
    }

    return {
      ticker: cleanTickers[i],
      error: result.reason?.message || 'Unknown error',
      success: false,
    };
  });
}

module.exports = { getPredictions };
