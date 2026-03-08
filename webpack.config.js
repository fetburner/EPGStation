const path = require('path');
const glob = require('glob');
const webpack = require('webpack');

// API ハンドラファイルのエントリー自動生成
const apiEntries = {};
glob.sync('src/model/service/api/**/*.ts').forEach(file => {
    // src/model/service/api/channels.ts → model/service/api/channels
    const entryName = file.replace(/^src\//, '').replace(/\.ts$/, '');
    apiEntries[entryName] = './' + file;
});

module.exports = {
    target: 'node',
    mode: 'production',
    entry: {
        // メインエントリーポイント（5つ）
        index: './src/index.ts',
        ServiceExecutor: './src/model/service/ServiceExecutor.ts',
        EPGUpdateExecutor: './src/model/epgUpdater/EPGUpdateExecutor.ts',
        DBTools: './src/DBTools.ts',
        V1MigrationTool: './src/V1MigrationTool.ts',
        // API ハンドラ（60ファイル）- express-openapi の fs-routes が必要とする
        ...apiEntries,
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
        libraryTarget: 'commonjs2', // require() で読み込めるようにする
        clean: true,
    },
    node: {
        __dirname: false,
        __filename: false,
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: {
                    loader: 'ts-loader',
                    options: {
                        transpileOnly: true,
                    },
                },
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    externals: {
        // ネイティブモジュール
        sqlite3: 'commonjs sqlite3',
        mysql: 'commonjs mysql',
        'diskusage-ng': 'commonjs diskusage-ng',
        // swagger-ui-dist はファイルシステムアクセスが必要
        'swagger-ui-dist': 'commonjs swagger-ui-dist',
    },
    plugins: [
        // TypeORM が動的に require する不要なドライバーを無視
        new webpack.IgnorePlugin({ resourceRegExp: /^(pg-native|pg-query-stream|react-native-sqlite-storage|sql\.js|better-sqlite3|ioredis|redis|typeorm-aurora-data-api-driver|oracledb|hdb-pool|@sap\/hana-client|mysql2|mssql|mongodb|@google-cloud\/spanner)$/ }),
        // ws のオプショナル依存
        new webpack.IgnorePlugin({ resourceRegExp: /^(bufferutil|utf-8-validate)$/ }),
        // openapi-framework の動的 require が .d.ts, .js.map, .tsbuildinfo を拾うのを防ぐ
        new webpack.ContextReplacementPlugin(
            /openapi-framework[\\/]dist/,
            /\.js$/,
        ),
    ],
    optimization: {
        minimize: false,
    },
    ignoreWarnings: [
        // express の動的 require
        { module: /express\/lib\/view\.js/ },
        // log4js の動的 require
        { module: /log4js\/lib\/appenders\/index\.js/ },
        // app-root-path の動的 require
        { module: /app-root-path/ },
        // typeorm の動的 require
        { module: /typeorm/ },
    ],
    devtool: 'source-map',
};
