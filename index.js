const postcss = require('postcss');
const camelCase = require('camelcase');

const pluginName = 'plumber';
const unitRegExp = /^(\d+(?:\.\d+)?)([a-z]{1,4})$/;
const defaults = {
    fontSize: 2,
    gridHeight: '1rem',
    lineHeight: 3,
    leadingTop: 1,
    leadingBottom: 2,
    useBaselineOrigin: false
};

module.exports = postcss.plugin(pluginName, (options = {}) => {
    // merge default and passed options
    options = Object.assign(defaults, options);
    return function (css, result) {
        css.walkAtRules(pluginName, rule => {
            // merge current parameters into options
            let params = Object.assign({}, options);
            rule.walkDecls(decl => {
                params[camelCase(decl.prop)] = decl.value;
            });

            // sanitize values
            Object.keys(params).forEach(prop => {
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

            const { lineHeight, fontSize, baseline } = params;
            const { gridHeight, unit } = params.gridHeight;
            let { leadingTop, leadingBottom } = params;
            let marginTop, marginBottom, paddingTop, paddingBottom;

            // *** CALCULATE BASELINE CORRECTION ***
            // the distance of the original baseline from the bottom
            const baselineFromBottom = (lineHeight - fontSize) / 2 + fontSize * baseline;
            // the corrected baseline will be on the nearest gridline
            const correctedBaseline = Math.round(baselineFromBottom);
            // the difference between the original and the corrected baseline
            const baselineDifference = correctedBaseline - baselineFromBottom;
            const shift = baselineDifference < 0 ? 0 : 1;

            if (params.useBaselineOrigin) {
                // substract the distance of the baseline from the edges
                leadingTop -= (lineHeight - correctedBaseline);
                leadingBottom -= correctedBaseline;
            }

            marginTop = leadingTop - shift;
            paddingTop = shift - baselineDifference;
            paddingBottom = 1 - shift + baselineDifference;
            marginBottom = leadingBottom + shift - 1;
        });
    };
});
