import { MATCHES, backtest, forecast1000, pScore, reasons } from '../src/lib/oracle';
const b = backtest();
console.log('matches in log', MATCHES.length, 'first', MATCHES[0].date, 'last', MATCHES[MATCHES.length - 1].date);
console.log(JSON.stringify({ ...b, rolling: b.rolling.length + ' points' }, null, 1));
console.log('next-match raw p', pScore(MATCHES).toFixed(3));
console.log(reasons());
console.log(forecast1000(15));
