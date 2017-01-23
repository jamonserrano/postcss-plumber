import postcss from 'postcss';
import test    from 'ava';
import plugin from './';

function run(t, input, output, options) {
	const result = postcss([ plugin(options) ]).process(input);
	t.deepEqual(result.css, output);
	t.deepEqual(result.warnings().length, 0);
}

test('works inside a selector', t => {
	run(t, 'p {@plumber;}', 'p {@plumber;}');
});

test('works without declarations', t => {
	run(t, 'p {@plumber;}', 'p {@plumber;}');
});

test('works with empty declarations', t => {
	run(t, 'p {@plumber {};}', 'p {@plumber {};}');
});

test('uses passed options', t => {
	run(t, 'p {@plumber {font-size: 5;line-height: 5;};}', 'p {@plumber {font-size: 5;line-height: 5;};}');
});

test.todo('overrides only passed options');

// test for validations