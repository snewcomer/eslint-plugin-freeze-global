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

Add `eslint-plugin-freeze-global` to the plugins section of your `.eslintrc` configuration file:

```json
{
    "plugins": [
        "freeze-global"
    ]
}
```


Then configure the rules you want to use under the rules section.

### No Mutable Global

```json
{
    "rules": {
        "freeze-global/no-mutable-global": 2
    }
}
```

#### Examples

❌ Invalid
```
import zod from 'zod';
const GLOBAL = {
    a: 1,
    b: 2,
    c: {
        d: 'e'
    }
};
```

✅ Valid with `["error", "no-mutable-global"]`
```
import zod from 'zod';
const GLOBAL = Object.freeze({
    a: 1,
    b: 2,
    c: Object.freeze({
        d: 'e',
    })
});
```

### No Naked Global

```json
{
    "rules": {
        "freeze-global/no-naked-global": 2
    }
}
```

#### Examples

❌ Invalid
```
import zod from 'zod';
const GLOBAL = {};
```

✅ Valid with `["error", "no-naked-global"]`
```
import zod from 'zod';
const GLOBAL = Object.freeze({});
```

Or refactor into a class or applicable location.
