# Known issues

## `npx tsc --noEmit` fails on a bare scaffold

As of Expo SDK 57 / React Native 0.86.3 / @types/react 19.2.18, running
`npx tsc --noEmit` in this app fails with errors like:

```
error TS2786: 'View' cannot be used as a JSX component.
```

This reproduces on a **completely untouched** `create-expo-app` scaffold —
it's a version-skew issue between React Native's bundled types and
`@types/react`, not a bug in this app's code. `npx expo install --fix`
reports everything as already up to date, so there's no immediate fix from
this side.

It doesn't block running the app: Metro/Babel strip types rather than
check them, so `npm run mobile` and the iOS build are unaffected. If it
starts bothering editor tooling, check for an updated `@types/react` /
`react-native` pairing, or watch https://github.com/expo/expo/issues for a
fix landing upstream.
