# rse-text-decoder

rse=text-decoder is a web tool designed to help translate the box names of the mainline Generation III Pokémon games into their hexadecimal encoding (and vice versa).

## Build instructions

### Requirements

- Git
- Node.js
- npm
- Your favourite terminal

### Instructions

> [!NOTE]
> `npm start` is a convenient shorthand for `npm build && npx serve dist/`, you may run this instead.

1. Clone this repository: `git clone https://github.com/it-is-final/rse-text-decoder.git`
2. `cd rse-text-decoder`
3. Install dependencies: `npm install`
4. Build: `npm build`
5. Run: `npx serve dist/`

## License

© final 2024-2025. rse-text-decoder is licensed under the terms of the MIT license, which can be found in `LICENSE`.

This project uses [`modern-normalize`](https://github.com/sindresorhus/modern-normalize) which is provided under the terms of the MIT license ([`LICENSE-MODERN-NORMALIZE`](LICENSE-MODERN-NORMALIZE)).

This project uses the [*Pokemon RS*][pkmn-rs-font], [*Pokemon FRLG*][pkmn-frlg-font], and [*Pokemon Emerald*][pkmn-e-font] fonts by [aztecwarrior28][aztecwarrior28].

[pkmn-rs-font]:     https://fontstruct.com/fontstructions/show/1964382/pokemon-rs-8
[pkmn-frlg-font]:   https://fontstruct.com/fontstructions/show/2399801/pokemon-frlg-10
[pkmn-e-font]:      https://fontstruct.com/fontstructions/show/1975556/pokemon-emerald-9
[aztecwarrior28]:   https://fontstruct.com/fontstructors/1606234/aztecwarrior28
