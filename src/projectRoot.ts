import * as path from 'path';
// webpack 設定で node.__dirname = false とするため、実行時の __dirname は
// バンドルファイルのディレクトリ（= dist/）を指す。
// dist/ の親がプロジェクトルート。
const PROJECT_ROOT = path.resolve(__dirname, '..');
export default PROJECT_ROOT;
