# Music instrument samples

Each `<instrument>.json` holds short mp3 samples (one every 4 semitones, mono) cut from the **FluidR3_GM** General MIDI
SoundFont by Frank Wen, as packaged by gleitz/midi-js-soundfonts. Released under the Creative Commons Attribution 3.0
license (https://creativecommons.org/licenses/by/3.0/). The game credits it at the bottom of Options.

Format: `{"n": name, "src": original instrument, "s": {"<midi note>": "<base64 mp3>"}}`. The songs themselves are in
`src/world/155-s161-soundtrack.js`.
