# challenge-framework

## JS Parser rationale
Both Acorn and Esprima support JS ES6
http://esprima.org/test/compare.html shows they take similar processing time: ~215ms to parse jQuery mobile, Angular 1, and React 0.13.

Esprima pros
* Bigger userbase (based on Google search ranking)
* Pretty web page
* More unit tests


Esprima cons
* Code is twice as big as Acorn
** Not a concern.
* Fewer options
** Not needed in our use cases

Overall, if I were to start over, I would probably go with Acorn. I was excited to jump into the implementation right away once I saw Esprima would fit my needs.

Our whitelist and blacklist handles presence of certain tokens/blocks but isn't designed to handle different quantities.