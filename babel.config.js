module.exports = {
  presets: [
    '@vue/app'
  ],
  "ignore": [
    "./src/page/login/all.js"
  ],
  plugins: [
    '@babel/plugin-proposal-optional-chaining' // 可选链运算符 ?.
  ]
}
