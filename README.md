# Postcss plugin for Plumber
https://jamonserrano.github.io/plumber-sass

Create better looking documents and speed up CSS development by adding vertical rhythm to your page.

> Looking for the SASS version? Go to https://jamonserrano.github.io/plumber-sass

## Installation

Install with npm or Yarn:

```sh
# NPM
$ npm install postcss-plumber --save-dev

#Yarn
$ yarn add postcss-plumber --dev
```

## Usage
1\. Decide on the vertical grid height you will use in the unit of your choice (pixels or rems are recommended).

2\. Look up the baseline ratio of your font family [in the table](https://jamonserrano.github.io/plumber-sass/baselines/) or [use the measure tool](https://jamonserrano.github.io/plumber-sass/measure/). For example the value for Roboto is 0.158203.

3\. Add Plumber to your postcss plugins (refer to the documentation of postcss and your preferred build tool):

```js
// gulpfile.js
...
postcss([
	require('postcss-plumber')()
])
...
```

4\. Include the `@plumber` rule in your styles and specify parameters as properties: font size as a fraction, line height, top and bottom leadings as multiples of the grid height:

```css
p {
	@plumber {
		grid-height: 1rem;
		baseline: 0.158203;
		font-size: 1.75;
		line-height: 3;
		leading-top: 1;
		leading-bottom: 2;
	};
	font-family: Roboto, sans-serif;
}
```

This will output the following CSS:

```css
p {
	font-size: 1.75rem;
	line-height: 3rem;
	margin-top: 0;
	padding-top: 0.901855rem;
	padding-bottom: 0.098145rem;
	margin-bottom: 2rem;
	font-family: Roboto, sans-serif;
}
```

### Default settings

To avoid repetition set up default values in the plugin configuration:

```js
// gulpfile.js
...
postcss([
	require('postcss-plumber')({
		gridHeight: '1rem',
		baseline: 0.158203,
		fontSize: 1.75,
		lineHeight: 3,
		leadingTop: 1,
		leadingBottom: 2
	})
])
...
```

```css
p {
	/* use default values */
	@plumber;
}

li {
	/* override leadings */
	@plumber {
		leading-top: 0;
		leading-bottom: 1;
	};
}

```

### Using multiple fonts

When using multiple font families just add different `baseline` parameters:

```css
p {
	@plumber {
		baseline: 0.158203;
	}
	font-family: Roboto, sans-serif;
}

blockquote {
	@plumber {
		baseline: 0.151123;
	}
	font-family: Georgia, serif;
}
```

### Responsive typography
For responsive typography define the grid height in rems or other relative units, and metrics will change along.

```js
// gulpfile.js
...
postcss([
	require('postcss-plumber')({
		gridHeight: '1rem',
		fontSize: 1.75
	})
])
...
```

```css
html {
	font-size: 8px;
	/* grid height => 8px, font size => 14px */
	
	@media min-width: 641px) {
		font-size: 12px;
		/* grid-height => 12px, font size => 21px */
	}
}
```

### Alternative leading calculation
Leadings are measured from the top and bottom edges of the text block by default. To measure them from the baseline, set `useBaselineOrigin: true` in the plugin options:

```js
// gulpfile.js
...
postcss([
	require('postcss-plumber')({
		useBaselineOrigin: 1
	})
])
...
```

… or `use-baseline-origin: 1` in your css:

```css
p {
	@plumber {
		use-baseline-origin: 1;
		...
	}
}
```


## Considerations

### Precision
Due to rounding and browser rendering it’s entirely possible that the text will not sit exactly on the baseline. Following these guidelines will get you closer to pixel perfection:

* Define grid height in pixels, or as a multiple of the base font height.
* Use a grid height with many divisors.
* Use font sizes that produce whole numbers with the grid height.

If you have access to the OpenType metrics of the font you can calculate a more precise baseline ratio with the following formula: `(UnitsPerEm − hhea.Ascender − hhea.Descender) / (2 × UnitsPerEm)`

### Varying baseline among fonts in the same family
Although some weights or styles in the same family can sit on different baselines, it’s generally fine to use the one for the regular font. If pixel perfection is important, set individual baselines for each font.

### Viewport-specific units
While supported, using vh, vw, vmin, vmax for the grid height can lead to catastrophic results.

### Collapsing margins
Plumber’s use of collapsing margins makes it possible to set the minimum distance between blocks of texts. If you don’t need this, you can set either `leading-top` or `leading-bottom` to 0.

### CSS validity
If you need valid CSS before processing, use [custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/--*) in the `@plumber` rule:

```css
p {
	@plumber {
		--grid-height: 1rem;
		--baseline: 0.158203;
		--font-size: 1.75;
		--line-height: 3;
		--leading-top: 1;
		--leading-bottom: 2;
	};
}
```

## API

### @plumber
The main rule.

**Properties:** All parameters are optional, default values can be set in the plugin options.


CSS (JS) property | Description | Type | Default value
---- | ----------- | ---- | -------------
baseline (baseline) | Baseline ratio | Fraction between 0 and 1 | —*
font-size (fontSize) | Font size as a fraction of grid height | Positive number | 2
grid-height (gridHeight) | Grid height | Any unit | 1rem
leading-top (leadingTop) | Top leading<sup>†</sup> as a multiple of grid height | Integer | 0<sup>‡</sup>
leading-bottom (leadingBottom) | Bottom leading<sup>†</sup> as a multiple of grid height | Integer | 0<sup>‡</sup>
line-height (lineHeight) | Line height as a multiple of grid height| Positive integer | 3
use-baseline-origin (useBaselineOrigin) | Set the origin of leadings to the baseline | 0 or 1 | 0

> \* Baseline must be provided either in the plugin options or in the rule properties.
>
> † Leadings are measured from either the baseline or the edges of the text block, depending on the `use-baseline-origin` (`useBaselineOrigin`) setting.
> 
> ‡ The default value is always calculated so there will be no visible gap above or below the text block.

**Output:** `font-size`, `line-height`, `margin-top`, `padding-top`, `padding-bottom`, `margin-bottom` properties with the same unit as the grid height.

## License
MIT License
