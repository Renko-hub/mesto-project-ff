const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: './src/pages/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'), // куда помещаются собранные файлы
    filename: 'bundle.js', // имя выходного JavaScript-файла
    publicPath: '/', // базовый публичный путь для всех ресурсов
  },
  mode: 'development', // development или production
  devServer: {
    static: path.resolve(__dirname, './dist'), // статический контент из dist
    compress: true, // сжатие gzip
    port: 8080, // порт запуска локального сервера
    open: true, // открытие страницы в браузере при запуске
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/, // исключить обработку node_modules
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/,
        type: 'asset/resource', // авто-копируем картинку в директорию dist
        generator: {
          filename: 'images/[name].[contenthash:8][ext]', // новые имена файлов с уникальным хэшем
        },
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource', // тоже касается шрифтов
        generator: {
          filename: 'fonts/[name].[contenthash:8][ext]', // уникальные имена для шрифтов
        },
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader, // выгружает CSS отдельно
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1, // поддержка импортируемых зависимостей
            },
          },
          'postcss-loader', // постобработка стилей
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({ // автоматическая генерация HTML
      template: './src/index.html',
      inject: true, // внедрять скрипты и стили в HTML
    }),
    new CleanWebpackPlugin(), // очистка старого содержимого dist перед каждой сборкой
    new MiniCssExtractPlugin(), // отделяет CSS в отдельные файлы
  ],
};