import postcss from 'postcss';
import test    from 'ava';
import plugin from './';

function run(t, options, input, output) {
	const result = postcss([ plugin(options) ]).process(input);
	//t.deepEqual(result.css, output);
	console.log(result.css);
	t.deepEqual(result.warnings().length, 0);
}
/*
test('works inside a selector', t => {
	run(t, 'p {@plumber;}', 'p {@plumber;}');
});

test('works without declarations', t => {
	run(t, 'p {@plumber;}', 'p {@plumber;}');
});

test('works with empty declarations', t => {
	run(t, 'p {@plumber {};}', 'p {@plumber {};}');
});
*/
test('uses passed options', t => {
	run(t, { baseline: 0.158203 }, 'p {@plumber;}');
});

//test.todo('overrides only passed options');

// test for validations