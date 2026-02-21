const { spawn } = require('child_process');
const path = require('path');
const { AppError } = require('./errorHandler');

const ML_SCRIPT = path.join(__dirname, 'mlService.py');
const PYTHON_CMD = process.env.PYTHON_CMD || 'python3';
const TIMEOUT_MS = 120_000; // 2 minutes per request

/**
 * Runs the Python ML script for a single ticker.
 * Returns parsed JSON result.
 */
function runMLService(ticker) {
  return new Promise((resolve, reject) => {
    const proc = spawn(PYTHON_CMD, [ML_SCRIPT, ticker], {
      env: { ...process.env, PYTHONUNBUFFERED: '1' },
    });

    let stdout = '';
    let stderr = '';

    const timeout = setTimeout(() => {
      proc.kill();
      reject(new AppError(`ML prediction timed out for ticker: ${ticker}`, 504));
    }, TIMEOUT_MS);

    proc.stdout.on('data', (chunk) => (stdout += chunk.toString()));
    proc.stderr.on('data', (chunk) => (stderr += chunk.toString()));

    proc.on('close', (code) => {
      clearTimeout(timeout);
      if (code !== 0) {
        console.error(`[mlService] stderr for ${ticker}:\n${stderr}`);
        const msg = extractPythonError(stderr) || `ML script failed for ${ticker}`;
        return reject(new AppError(msg, 422));
      }
      try {
        const result = JSON.parse(stdout.trim());
        if (result.error) {
          return reject(new AppError(result.error, 422));
        }
        resolve(result);
      } catch {
        reject(new AppError(`Failed to parse ML output for ${ticker}`, 500));
      }
    });

    proc.on('error', (err) => {
      clearTimeout(timeout);
      reject(new AppError(`Failed to start Python process: ${err.message}`, 500));
    });
  });
}

function extractPythonError(stderr) {
  const lines = stderr.trim().split('\n');
  const lastLine = lines[lines.length - 1];
  if (lastLine && lastLine.length < 300) return lastLine;
  return null;
}

/**
 * Fetch predictions for multiple tickers in parallel.
 */
async function getPredictions(tickers) {
  const results = await Promise.allSettled(
    tickers.map((ticker) => runMLService(ticker))
  );

  return results.map((result, i) => {
    if (result.status === 'fulfilled') {
      return result.value;
    }
    return {
      ticker: tickers[i],
      error: result.reason?.message || 'Unknown error',
      success: false,
    };
  });
}

module.exports = { getPredictions };
