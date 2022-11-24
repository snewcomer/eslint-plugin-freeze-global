# eslint-plugin-freeze-global

Object.freeze globals to prevent accidental mutation during the life of your program.

## Installation

You'll first need to install [ESLint](https://eslint.org/):

```sh
npm i eslint --save-dev
```

Next, install `eslint-plugin-freeze-global`:

```sh
npm install eslint-plugin-freeze-global --save-dev
```

## Usage

Add `freeze-global` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "plugins": [
        "freeze-global"
    ]
}
```


Then configure the rules you want to use under the rules section.

```json
{
    "rules": {
        "freeze-global/rule-name": 2
    }
}
```


