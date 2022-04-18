# CommunicativeCode

Born out of the idea that it'd be cool for code to communicate that we are *asking* the computer to do something. 

My thinking is that this would be helpful in teaching programming to students, so that the code they read helps them internalize that they are giving the computer instructions. 

So instead, of:

```js
const bunny = {
  hop: () => {...}
}

bunny.hop(); // from this
```

They would read (and write):

```js
const bunny = {
  hop: () => {...}
}

ask(bunny).to("hop"); // to this
```

Not convinced that's better? Well, fair enough. After all, it is longer, which we all don't like. 

But I think this pattern comes alive when we are interacting with many objects. Like below:

```js
// work in progress
```

And as a side effect, this allows us to do some really cool stuff around subscribing to function calls. Because there's a central mechanism for calling functions (the `ask(___).to(___)` mechanism), we can create some really interesting effects with very minimal code. 

Like consider the following: 

```js
// work in progress
```