use rustyscript::deno_core::extension;

use crate::ext::fs::Permissions;

/*
   import { readFileSync } from 'fs'
   import { dirname } from 'path'
*/

extension!(
  init_fs,
  deps = [rustyscript],
  esm_entry_point = "ext:init_fs/init_fs.js",
  esm = [
    dir "src/ext/init_fs", "init_fs.js",
    // dir "src/ext/init_fs", "path.js",
  ],
  state = |state| state.put(Permissions{})
);
