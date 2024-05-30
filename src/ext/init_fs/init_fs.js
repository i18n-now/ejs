import * as io from "ext:deno_io/12_io.js";
import * as fs from "ext:deno_fs/30_fs.js";

import {
	applyToGlobal,
	// writeable,
	nonEnumerable,
} from "ext:rustyscript/rustyscript.js";

applyToGlobal({
	// io: nonEnumerable(io),
	fs: nonEnumerable(fs),
	// fs: nonEnumerable(fs),
});
