const postcss = require('postcss');

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

// Converts css property names (including custom properties) to their javascript counterparts e.g.
// font-size -> fontSize
// --grid-height -> gridHeight
const toCamelCase = (value) => {
    return value.replace(/^-+/, '').replace(/-([a-z])/g, (nothing, match) => match.toUpperCase());
};

// Converts javascript property names to their css counterparts e.g.
// fontSize -> font-size
const toKebabCase = (value) => {
    return value.replace(/([A-Z])/g, (match) => '-' + match.toLowerCase());
};

// Round value to the nearest quarter pixel
const round = (value) => Math.round(value * 4) / 4;

const sanitizeParams = (params) => {
    Object.keys(params).forEach(prop => {
        let value = params[prop];
        // separate value and unit
        if (prop === 'gridHeight') {
            const match = unitRegExp.exec(value);
            value = {
                gridHeight: Number(match[1]),
                unit: match[2]
            };
        } else {
            value = Number(value);
        }
        params[prop] = value;
    });

    return params;
};

const generateDeclarations = (values, unit) => {
    let declarations = [];
    Object.keys(values).forEach(prop => {
        declarations.push(
            postcss.decl({
                prop: toKebabCase(prop),
                value: values[prop].toFixed(6) + unit
            })
        );
    });

    return declarations;
};

const getBaselineCorrection = (lineHeight, fontSize, baseline) => {
    // the distance of the original baseline from the bottom
    const baselineFromBottom = (lineHeight - fontSize) / 2 + fontSize * baseline;
    // the corrected baseline will be on the nearest gridline
    const correctedBaseline = Math.round(baselineFromBottom);
    // the difference between the original and the corrected baseline
    const baselineDifference = correctedBaseline - baselineFromBottom;

    return { correctedBaseline, baselineDifference };
};

module.exports = postcss.plugin(pluginName, (options = {}) => {
    // merge default and passed options
    options = Object.assign(defaults, options);
    return function (css) {
        css.walkAtRules(pluginName, rule => {
            // merge current parameters into options
            let params = Object.assign({}, options);
            rule.walkDecls(decl => {
                params[toCamelCase(decl.prop)] = decl.value;
            });

            // sanitize values
            params = sanitizeParams(params);

            const { baseline } = params;
            const { gridHeight, unit } = params.gridHeight;
            let { fontSize, lineHeight, leadingTop, leadingBottom } = params;
            let marginTop, marginBottom, paddingTop, paddingBottom;

            const { correctedBaseline, baselineDifference } = getBaselineCorrection(
                lineHeight,
                fontSize,
                baseline
            );

            if (params.useBaselineOrigin) {
                // substract the distance of the baseline from the edges
                leadingTop -= (lineHeight - correctedBaseline);
                leadingBottom -= correctedBaseline;
            }

            const shift = baselineDifference < 0 ? 0 : 1;

            fontSize = fontSize * gridHeight;
            lineHeight = lineHeight * gridHeight;
            marginTop = (leadingTop - shift) * gridHeight;
            paddingTop = (shift - baselineDifference) * gridHeight;
            paddingBottom = (1 - shift + baselineDifference) * gridHeight;
            marginBottom = (leadingBottom + shift - 1) * gridHeight;

            let computedValues = {
                lineHeight,
                marginTop,
                paddingTop,
                paddingBottom,
                marginBottom
            };

            if (unit === 'px') {
                Object.keys(computedValues).forEach(function (prop) {
                    computedValues[prop] = round(computedValues[prop]);
                });
            }

            Object.assign(computedValues, { fontSize });

            rule.replaceWith(generateDeclarations(computedValues, unit));
        });
    };
});
