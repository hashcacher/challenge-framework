# challenge-framework

#### JS Parser rationale
Both Acorn and Esprima support JS ES6
http://esprima.org/test/compare.html shows they take similar processing time: ~215ms to parse jQuery mobile, Angular 1, and React 0.13.

Esprima pros
* Bigger userbase (based on Google search ranking)
* Pretty web page
* More unit tests
* Tokenizer
* ESLint uses it

Esprima cons
* Code is twice as big as Acorn
	* Not a concern.
* Fewer options
	* Acorn has huge extensibility via callbacks
	* Not needed in our use cases

I jumped into Esprima right away once I saw that it would fit my needs. I later did more research and found Acorn to be more nimble. If I were to start over, I would go with Acorn. 

#### Future task list and rationale
* Our whitelist and blacklist handles presence of certain tokens/blocks but isn't designed to handle different quantities. 
* Our AST parser doesn't try to go inside CallExpressions. Could be tricky since source code usually isn't readily available.
* My Git commits are pretty bulky, but that's simply due to the ultra time constrained nature of this project.
* Make "all good" result colored black or green instead of red.
* Bug where it things the code is empty on reload. onchange isn't triggered.