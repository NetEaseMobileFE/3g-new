module.exports = {
  "extends": "airbnb",
  "ecmaFeatures": {
    "jsx": true,
    "modules": true
  },
  "env": {
    "browser": true,
    "es6": true,
    "jquery": true
  },
  "parser": "babel-eslint",
  "rules": {
    "linebreak-style": 0,
    "semi": [2, "never"],
    "max-len": 0,
    "no-alert": 2,
    "prefer-template": 0,
    "no-trailing-spaces": 0,
    "react/prop-types": 1,
    "react/jsx-no-bind": 1,
    "comma-dangle": 0,
    "new-cap": 1,
    "no-else-return": 1,
    "prefer-const": 0,
    "quotes": [2, "single"],
    "strict": [2, "never"],
    "babel/arrow-parens": 0,
    "arrow-body-style": 0,
    "babel/generator-star-spacing": 1,
    "babel/object-shorthand": 1,
    "babel/no-await-in-loop": 1,
    "react/jsx-uses-react": 2,
    "react/jsx-uses-vars": 2,
    "react/react-in-jsx-scope": 2,
    "react/jsx-closing-bracket-location": 0
  },
  "plugins": [
    "babel",
    "react"
  ]
}