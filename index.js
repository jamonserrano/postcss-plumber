const postcss = require('postcss');
const camelCase = require('camelcase');

const pluginName = 'plumber';
const unitRegExp = /^(\d+(?:\.\d+)?)([a-z]{1,4})$/;
const defaults = {
    fontSize: 2,
    gridHeight: '1rem',
    lineHeight: 3,
    leadingTop: 1,
    leadingBottom: 2
};

module.exports = postcss.plugin(pluginName, (options = {}) => {
    // merge default and passed options
    options = Object.assign(defaults, options);
    return function (css, result) {
        css.walkAtRules(pluginName, rule => {
            // merge actual parameters into options
            let params = Object.assign({}, options);
            rule.walkDecls(decl => {
                params[camelCase(decl.prop)] = decl.value;
            });

            // sanitize values
            Object.keys(params).forEach((prop) => {
                let value = params[prop];
                // separate value and unit
                if (prop === 'gridHeight') {
                    const match = unitRegExp.exec(value);
                    value = {
                        value: Number(match[1]),
                        unit: match[2]
                    };
                } else {
                    value = Number(value);
                }
                params[prop] = value;
            });

            console.log(params);
            // check if the mixin has a parent selector
            if (!rule.parent.selector) {
                result.warn('must be inside a selector');
            }
        });
    };
});
