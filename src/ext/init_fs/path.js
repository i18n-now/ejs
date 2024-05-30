function assertPath(path) {
	if (typeof path !== "string") {
		throw new TypeError(
			`Path must be a string. Received ${JSON.stringify(path)}`,
		);
	}
}
function stripSuffix(name, suffix) {
	if (suffix.length >= name.length) {
		return name;
	}
	const lenDiff = name.length - suffix.length;
	for (let i = suffix.length - 1; i >= 0; --i) {
		if (name.charCodeAt(lenDiff + i) !== suffix.charCodeAt(i)) {
			return name;
		}
	}
	return name.slice(0, -suffix.length);
}
function lastPathSegment(path, isSep, start = 0) {
	let matchedNonSeparator = false;
	let end = path.length;
	for (let i = path.length - 1; i >= start; --i) {
		if (isSep(path.charCodeAt(i))) {
			if (matchedNonSeparator) {
				start = i + 1;
				break;
			}
		} else if (!matchedNonSeparator) {
			matchedNonSeparator = true;
			end = i + 1;
		}
	}
	return path.slice(start, end);
}
function assertArgs(path, suffix) {
	assertPath(path);
	if (path.length === 0) return path;
	if (typeof suffix !== "string") {
		throw new TypeError(
			`Suffix must be a string. Received ${JSON.stringify(suffix)}`,
		);
	}
}
const CHAR_FORWARD_SLASH = 47;
function stripTrailingSeparators(segment, isSep) {
	if (segment.length <= 1) {
		return segment;
	}
	let end = segment.length;
	for (let i = segment.length - 1; i > 0; i--) {
		if (isSep(segment.charCodeAt(i))) {
			end = i;
		} else {
			break;
		}
	}
	return segment.slice(0, end);
}
function isPosixPathSeparator(code) {
	return code === 47;
}
function isPathSeparator(code) {
	return code === 47 || code === 92;
}
function isWindowsDeviceRoot(code) {
	return (code >= 97 && code <= 122) || (code >= 65 && code <= 90);
}
function basename(path, suffix = "") {
	assertArgs(path, suffix);
	let start = 0;
	if (path.length >= 2) {
		const drive = path.charCodeAt(0);
		if (isWindowsDeviceRoot(drive)) {
			if (path.charCodeAt(1) === 58) start = 2;
		}
	}
	const lastSegment = lastPathSegment(path, isPathSeparator, start);
	const strippedSegment = stripTrailingSeparators(lastSegment, isPathSeparator);
	return suffix ? stripSuffix(strippedSegment, suffix) : strippedSegment;
}
const DELIMITER = ";";
const SEPARATOR = "\\";
const SEPARATOR_PATTERN = /[\\/]+/;
function assertArg(path) {
	assertPath(path);
	if (path.length === 0) return ".";
}
function dirname(path) {
	assertArg(path);
	const len = path.length;
	let rootEnd = -1;
	let end = -1;
	let matchedSlash = true;
	let offset = 0;
	const code = path.charCodeAt(0);
	if (len > 1) {
		if (isPathSeparator(code)) {
			rootEnd = offset = 1;
			if (isPathSeparator(path.charCodeAt(1))) {
				let j = 2;
				let last = j;
				for (; j < len; ++j) {
					if (isPathSeparator(path.charCodeAt(j))) break;
				}
				if (j < len && j !== last) {
					last = j;
					for (; j < len; ++j) {
						if (!isPathSeparator(path.charCodeAt(j))) break;
					}
					if (j < len && j !== last) {
						last = j;
						for (; j < len; ++j) {
							if (isPathSeparator(path.charCodeAt(j))) break;
						}
						if (j === len) {
							return path;
						}
						if (j !== last) {
							rootEnd = offset = j + 1;
						}
					}
				}
			}
		} else if (isWindowsDeviceRoot(code)) {
			if (path.charCodeAt(1) === 58) {
				rootEnd = offset = 2;
				if (len > 2) {
					if (isPathSeparator(path.charCodeAt(2))) rootEnd = offset = 3;
				}
			}
		}
	} else if (isPathSeparator(code)) {
		return path;
	}
	for (let i = len - 1; i >= offset; --i) {
		if (isPathSeparator(path.charCodeAt(i))) {
			if (!matchedSlash) {
				end = i;
				break;
			}
		} else {
			matchedSlash = false;
		}
	}
	if (end === -1) {
		if (rootEnd === -1) return ".";
		else end = rootEnd;
	}
	return stripTrailingSeparators(path.slice(0, end), isPosixPathSeparator);
}
function extname(path) {
	assertPath(path);
	let start = 0;
	let startDot = -1;
	let startPart = 0;
	let end = -1;
	let matchedSlash = true;
	let preDotState = 0;
	if (
		path.length >= 2 &&
		path.charCodeAt(1) === 58 &&
		isWindowsDeviceRoot(path.charCodeAt(0))
	) {
		start = startPart = 2;
	}
	for (let i = path.length - 1; i >= start; --i) {
		const code = path.charCodeAt(i);
		if (isPathSeparator(code)) {
			if (!matchedSlash) {
				startPart = i + 1;
				break;
			}
			continue;
		}
		if (end === -1) {
			matchedSlash = false;
			end = i + 1;
		}
		if (code === 46) {
			if (startDot === -1) startDot = i;
			else if (preDotState !== 1) preDotState = 1;
		} else if (startDot !== -1) {
			preDotState = -1;
		}
	}
	if (
		startDot === -1 ||
		end === -1 ||
		preDotState === 0 ||
		(preDotState === 1 && startDot === end - 1 && startDot === startPart + 1)
	) {
		return "";
	}
	return path.slice(startDot, end);
}
function _format(sep, pathObject) {
	const dir = pathObject.dir || pathObject.root;
	const base =
		pathObject.base || (pathObject.name || "") + (pathObject.ext || "");
	if (!dir) return base;
	if (base === sep) return dir;
	if (dir === pathObject.root) return dir + base;
	return dir + sep + base;
}
function assertArg1(pathObject) {
	if (pathObject === null || typeof pathObject !== "object") {
		throw new TypeError(
			`The "pathObject" argument must be of type Object. Received type ${typeof pathObject}`,
		);
	}
}
function format(pathObject) {
	assertArg1(pathObject);
	return _format("\\", pathObject);
}
function assertArg2(url) {
	url = url instanceof URL ? url : new URL(url);
	if (url.protocol !== "file:") {
		throw new TypeError("Must be a file URL.");
	}
	return url;
}
function fromFileUrl(url) {
	url = assertArg2(url);
	let path = decodeURIComponent(
		url.pathname.replace(/\//g, "\\").replace(/%(?![0-9A-Fa-f]{2})/g, "%25"),
	).replace(/^\\*([A-Za-z]:)(\\|$)/, "$1\\");
	if (url.hostname !== "") {
		path = `\\\\${url.hostname}${path}`;
	}
	return path;
}
function isAbsolute(path) {
	assertPath(path);
	const len = path.length;
	if (len === 0) return false;
	const code = path.charCodeAt(0);
	if (isPathSeparator(code)) {
		return true;
	} else if (isWindowsDeviceRoot(code)) {
		if (len > 2 && path.charCodeAt(1) === 58) {
			if (isPathSeparator(path.charCodeAt(2))) return true;
		}
	}
	return false;
}
class AssertionError extends Error {
	constructor(message) {
		super(message);
		this.name = "AssertionError";
	}
}
function assert(expr, msg = "") {
	if (!expr) {
		throw new AssertionError(msg);
	}
}
function assertArg3(path) {
	assertPath(path);
	if (path.length === 0) return ".";
}
function normalizeString(path, allowAboveRoot, separator, isPathSeparator) {
	let res = "";
	let lastSegmentLength = 0;
	let lastSlash = -1;
	let dots = 0;
	let code;
	for (let i = 0; i <= path.length; ++i) {
		if (i < path.length) code = path.charCodeAt(i);
		else if (isPathSeparator(code)) break;
		else code = CHAR_FORWARD_SLASH;
		if (isPathSeparator(code)) {
			if (lastSlash === i - 1 || dots === 1) {
			} else if (lastSlash !== i - 1 && dots === 2) {
				if (
					res.length < 2 ||
					lastSegmentLength !== 2 ||
					res.charCodeAt(res.length - 1) !== 46 ||
					res.charCodeAt(res.length - 2) !== 46
				) {
					if (res.length > 2) {
						const lastSlashIndex = res.lastIndexOf(separator);
						if (lastSlashIndex === -1) {
							res = "";
							lastSegmentLength = 0;
						} else {
							res = res.slice(0, lastSlashIndex);
							lastSegmentLength = res.length - 1 - res.lastIndexOf(separator);
						}
						lastSlash = i;
						dots = 0;
						continue;
					} else if (res.length === 2 || res.length === 1) {
						res = "";
						lastSegmentLength = 0;
						lastSlash = i;
						dots = 0;
						continue;
					}
				}
				if (allowAboveRoot) {
					if (res.length > 0) res += `${separator}..`;
					else res = "..";
					lastSegmentLength = 2;
				}
			} else {
				if (res.length > 0) res += separator + path.slice(lastSlash + 1, i);
				else res = path.slice(lastSlash + 1, i);
				lastSegmentLength = i - lastSlash - 1;
			}
			lastSlash = i;
			dots = 0;
		} else if (code === 46 && dots !== -1) {
			++dots;
		} else {
			dots = -1;
		}
	}
	return res;
}
function normalize(path) {
	assertArg3(path);
	const len = path.length;
	let rootEnd = 0;
	let device;
	let isAbsolute = false;
	const code = path.charCodeAt(0);
	if (len > 1) {
		if (isPathSeparator(code)) {
			isAbsolute = true;
			if (isPathSeparator(path.charCodeAt(1))) {
				let j = 2;
				let last = j;
				for (; j < len; ++j) {
					if (isPathSeparator(path.charCodeAt(j))) break;
				}
				if (j < len && j !== last) {
					const firstPart = path.slice(last, j);
					last = j;
					for (; j < len; ++j) {
						if (!isPathSeparator(path.charCodeAt(j))) break;
					}
					if (j < len && j !== last) {
						last = j;
						for (; j < len; ++j) {
							if (isPathSeparator(path.charCodeAt(j))) break;
						}
						if (j === len) {
							return `\\\\${firstPart}\\${path.slice(last)}\\`;
						} else if (j !== last) {
							device = `\\\\${firstPart}\\${path.slice(last, j)}`;
							rootEnd = j;
						}
					}
				}
			} else {
				rootEnd = 1;
			}
		} else if (isWindowsDeviceRoot(code)) {
			if (path.charCodeAt(1) === 58) {
				device = path.slice(0, 2);
				rootEnd = 2;
				if (len > 2) {
					if (isPathSeparator(path.charCodeAt(2))) {
						isAbsolute = true;
						rootEnd = 3;
					}
				}
			}
		}
	} else if (isPathSeparator(code)) {
		return "\\";
	}
	let tail;
	if (rootEnd < len) {
		tail = normalizeString(
			path.slice(rootEnd),
			!isAbsolute,
			"\\",
			isPathSeparator,
		);
	} else {
		tail = "";
	}
	if (tail.length === 0 && !isAbsolute) tail = ".";
	if (tail.length > 0 && isPathSeparator(path.charCodeAt(len - 1))) {
		tail += "\\";
	}
	if (device === undefined) {
		if (isAbsolute) {
			if (tail.length > 0) return `\\${tail}`;
			else return "\\";
		} else if (tail.length > 0) {
			return tail;
		} else {
			return "";
		}
	} else if (isAbsolute) {
		if (tail.length > 0) return `${device}\\${tail}`;
		else return `${device}\\`;
	} else if (tail.length > 0) {
		return device + tail;
	} else {
		return device;
	}
}
function join(...paths) {
	if (paths.length === 0) return ".";
	let joined;
	let firstPart = null;
	for (let i = 0; i < paths.length; ++i) {
		const path = paths[i];
		assertPath(path);
		if (path.length > 0) {
			if (joined === undefined) joined = firstPart = path;
			else joined += `\\${path}`;
		}
	}
	if (joined === undefined) return ".";
	let needsReplace = true;
	let slashCount = 0;
	assert(firstPart !== null);
	if (isPathSeparator(firstPart.charCodeAt(0))) {
		++slashCount;
		const firstLen = firstPart.length;
		if (firstLen > 1) {
			if (isPathSeparator(firstPart.charCodeAt(1))) {
				++slashCount;
				if (firstLen > 2) {
					if (isPathSeparator(firstPart.charCodeAt(2))) ++slashCount;
					else {
						needsReplace = false;
					}
				}
			}
		}
	}
	if (needsReplace) {
		for (; slashCount < joined.length; ++slashCount) {
			if (!isPathSeparator(joined.charCodeAt(slashCount))) break;
		}
		if (slashCount >= 2) joined = `\\${joined.slice(slashCount)}`;
	}
	return normalize(joined);
}
function parse(path) {
	assertPath(path);
	const ret = {
		root: "",
		dir: "",
		base: "",
		ext: "",
		name: "",
	};
	const len = path.length;
	if (len === 0) return ret;
	let rootEnd = 0;
	let code = path.charCodeAt(0);
	if (len > 1) {
		if (isPathSeparator(code)) {
			rootEnd = 1;
			if (isPathSeparator(path.charCodeAt(1))) {
				let j = 2;
				let last = j;
				for (; j < len; ++j) {
					if (isPathSeparator(path.charCodeAt(j))) break;
				}
				if (j < len && j !== last) {
					last = j;
					for (; j < len; ++j) {
						if (!isPathSeparator(path.charCodeAt(j))) break;
					}
					if (j < len && j !== last) {
						last = j;
						for (; j < len; ++j) {
							if (isPathSeparator(path.charCodeAt(j))) break;
						}
						if (j === len) {
							rootEnd = j;
						} else if (j !== last) {
							rootEnd = j + 1;
						}
					}
				}
			}
		} else if (isWindowsDeviceRoot(code)) {
			if (path.charCodeAt(1) === 58) {
				rootEnd = 2;
				if (len > 2) {
					if (isPathSeparator(path.charCodeAt(2))) {
						if (len === 3) {
							ret.root = ret.dir = path;
							ret.base = "\\";
							return ret;
						}
						rootEnd = 3;
					}
				} else {
					ret.root = ret.dir = path;
					return ret;
				}
			}
		}
	} else if (isPathSeparator(code)) {
		ret.root = ret.dir = path;
		ret.base = "\\";
		return ret;
	}
	if (rootEnd > 0) ret.root = path.slice(0, rootEnd);
	let startDot = -1;
	let startPart = rootEnd;
	let end = -1;
	let matchedSlash = true;
	let i = path.length - 1;
	let preDotState = 0;
	for (; i >= rootEnd; --i) {
		code = path.charCodeAt(i);
		if (isPathSeparator(code)) {
			if (!matchedSlash) {
				startPart = i + 1;
				break;
			}
			continue;
		}
		if (end === -1) {
			matchedSlash = false;
			end = i + 1;
		}
		if (code === 46) {
			if (startDot === -1) startDot = i;
			else if (preDotState !== 1) preDotState = 1;
		} else if (startDot !== -1) {
			preDotState = -1;
		}
	}
	if (
		startDot === -1 ||
		end === -1 ||
		preDotState === 0 ||
		(preDotState === 1 && startDot === end - 1 && startDot === startPart + 1)
	) {
		if (end !== -1) {
			ret.base = ret.name = path.slice(startPart, end);
		}
	} else {
		ret.name = path.slice(startPart, startDot);
		ret.base = path.slice(startPart, end);
		ret.ext = path.slice(startDot, end);
	}
	ret.base = ret.base || "\\";
	if (startPart > 0 && startPart !== rootEnd) {
		ret.dir = path.slice(0, startPart - 1);
	} else ret.dir = ret.root;
	return ret;
}
function resolve(...pathSegments) {
	let resolvedDevice = "";
	let resolvedTail = "";
	let resolvedAbsolute = false;
	for (let i = pathSegments.length - 1; i >= -1; i--) {
		let path;
		const { Deno } = globalThis;
		if (i >= 0) {
			path = pathSegments[i];
		} else if (!resolvedDevice) {
			if (typeof Deno?.cwd !== "function") {
				throw new TypeError("Resolved a drive-letter-less path without a CWD.");
			}
			path = Deno.cwd();
		} else {
			if (
				typeof Deno?.env?.get !== "function" ||
				typeof Deno?.cwd !== "function"
			) {
				throw new TypeError("Resolved a relative path without a CWD.");
			}
			path = Deno.cwd();
			if (
				path === undefined ||
				path.slice(0, 3).toLowerCase() !== `${resolvedDevice.toLowerCase()}\\`
			) {
				path = `${resolvedDevice}\\`;
			}
		}
		assertPath(path);
		const len = path.length;
		if (len === 0) continue;
		let rootEnd = 0;
		let device = "";
		let isAbsolute = false;
		const code = path.charCodeAt(0);
		if (len > 1) {
			if (isPathSeparator(code)) {
				isAbsolute = true;
				if (isPathSeparator(path.charCodeAt(1))) {
					let j = 2;
					let last = j;
					for (; j < len; ++j) {
						if (isPathSeparator(path.charCodeAt(j))) break;
					}
					if (j < len && j !== last) {
						const firstPart = path.slice(last, j);
						last = j;
						for (; j < len; ++j) {
							if (!isPathSeparator(path.charCodeAt(j))) break;
						}
						if (j < len && j !== last) {
							last = j;
							for (; j < len; ++j) {
								if (isPathSeparator(path.charCodeAt(j))) break;
							}
							if (j === len) {
								device = `\\\\${firstPart}\\${path.slice(last)}`;
								rootEnd = j;
							} else if (j !== last) {
								device = `\\\\${firstPart}\\${path.slice(last, j)}`;
								rootEnd = j;
							}
						}
					}
				} else {
					rootEnd = 1;
				}
			} else if (isWindowsDeviceRoot(code)) {
				if (path.charCodeAt(1) === 58) {
					device = path.slice(0, 2);
					rootEnd = 2;
					if (len > 2) {
						if (isPathSeparator(path.charCodeAt(2))) {
							isAbsolute = true;
							rootEnd = 3;
						}
					}
				}
			}
		} else if (isPathSeparator(code)) {
			rootEnd = 1;
			isAbsolute = true;
		}
		if (
			device.length > 0 &&
			resolvedDevice.length > 0 &&
			device.toLowerCase() !== resolvedDevice.toLowerCase()
		) {
			continue;
		}
		if (resolvedDevice.length === 0 && device.length > 0) {
			resolvedDevice = device;
		}
		if (!resolvedAbsolute) {
			resolvedTail = `${path.slice(rootEnd)}\\${resolvedTail}`;
			resolvedAbsolute = isAbsolute;
		}
		if (resolvedAbsolute && resolvedDevice.length > 0) break;
	}
	resolvedTail = normalizeString(
		resolvedTail,
		!resolvedAbsolute,
		"\\",
		isPathSeparator,
	);
	return resolvedDevice + (resolvedAbsolute ? "\\" : "") + resolvedTail || ".";
}
function assertArgs1(from, to) {
	assertPath(from);
	assertPath(to);
	if (from === to) return "";
}
function relative(from, to) {
	assertArgs1(from, to);
	const fromOrig = resolve(from);
	const toOrig = resolve(to);
	if (fromOrig === toOrig) return "";
	from = fromOrig.toLowerCase();
	to = toOrig.toLowerCase();
	if (from === to) return "";
	let fromStart = 0;
	let fromEnd = from.length;
	for (; fromStart < fromEnd; ++fromStart) {
		if (from.charCodeAt(fromStart) !== 92) break;
	}
	for (; fromEnd - 1 > fromStart; --fromEnd) {
		if (from.charCodeAt(fromEnd - 1) !== 92) break;
	}
	const fromLen = fromEnd - fromStart;
	let toStart = 0;
	let toEnd = to.length;
	for (; toStart < toEnd; ++toStart) {
		if (to.charCodeAt(toStart) !== 92) break;
	}
	for (; toEnd - 1 > toStart; --toEnd) {
		if (to.charCodeAt(toEnd - 1) !== 92) break;
	}
	const toLen = toEnd - toStart;
	const length = fromLen < toLen ? fromLen : toLen;
	let lastCommonSep = -1;
	let i = 0;
	for (; i <= length; ++i) {
		if (i === length) {
			if (toLen > length) {
				if (to.charCodeAt(toStart + i) === 92) {
					return toOrig.slice(toStart + i + 1);
				} else if (i === 2) {
					return toOrig.slice(toStart + i);
				}
			}
			if (fromLen > length) {
				if (from.charCodeAt(fromStart + i) === 92) {
					lastCommonSep = i;
				} else if (i === 2) {
					lastCommonSep = 3;
				}
			}
			break;
		}
		const fromCode = from.charCodeAt(fromStart + i);
		const toCode = to.charCodeAt(toStart + i);
		if (fromCode !== toCode) break;
		else if (fromCode === 92) lastCommonSep = i;
	}
	if (i !== length && lastCommonSep === -1) {
		return toOrig;
	}
	let out = "";
	if (lastCommonSep === -1) lastCommonSep = 0;
	for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
		if (i === fromEnd || from.charCodeAt(i) === 92) {
			if (out.length === 0) out += "..";
			else out += "\\..";
		}
	}
	if (out.length > 0) {
		return out + toOrig.slice(toStart + lastCommonSep, toEnd);
	} else {
		toStart += lastCommonSep;
		if (toOrig.charCodeAt(toStart) === 92) ++toStart;
		return toOrig.slice(toStart, toEnd);
	}
}
const WHITESPACE_ENCODINGS = {
	"\u0009": "%09",
	"\u000A": "%0A",
	"\u000B": "%0B",
	"\u000C": "%0C",
	"\u000D": "%0D",
	"\u0020": "%20",
};
function encodeWhitespace(string) {
	return string.replaceAll(/[\s]/g, (c) => {
		return WHITESPACE_ENCODINGS[c] ?? c;
	});
}
function toFileUrl(path) {
	if (!isAbsolute(path)) {
		throw new TypeError("Must be an absolute path.");
	}
	const [, hostname, pathname] = path.match(
		/^(?:[/\\]{2}([^/\\]+)(?=[/\\](?:[^/\\]|$)))?(.*)/,
	);
	const url = new URL("file:///");
	url.pathname = encodeWhitespace(pathname.replace(/%/g, "%25"));
	if (hostname !== undefined && hostname !== "localhost") {
		url.hostname = hostname;
		if (!url.hostname) {
			throw new TypeError("Invalid hostname.");
		}
	}
	return url;
}
function toNamespacedPath(path) {
	if (typeof path !== "string") return path;
	if (path.length === 0) return "";
	const resolvedPath = resolve(path);
	if (resolvedPath.length >= 3) {
		if (resolvedPath.charCodeAt(0) === 92) {
			if (resolvedPath.charCodeAt(1) === 92) {
				const code = resolvedPath.charCodeAt(2);
				if (code !== 63 && code !== 46) {
					return `\\\\?\\UNC\\${resolvedPath.slice(2)}`;
				}
			}
		} else if (isWindowsDeviceRoot(resolvedPath.charCodeAt(0))) {
			if (
				resolvedPath.charCodeAt(1) === 58 &&
				resolvedPath.charCodeAt(2) === 92
			) {
				return `\\\\?\\${resolvedPath}`;
			}
		}
	}
	return path;
}
function _common(paths, sep) {
	const [first = "", ...remaining] = paths;
	const parts = first.split(sep);
	let endOfPrefix = parts.length;
	let append = "";
	for (const path of remaining) {
		const compare = path.split(sep);
		if (compare.length <= endOfPrefix) {
			endOfPrefix = compare.length;
			append = "";
		}
		for (let i = 0; i < endOfPrefix; i++) {
			if (compare[i] !== parts[i]) {
				endOfPrefix = i;
				append = i === 0 ? "" : sep;
				break;
			}
		}
	}
	return parts.slice(0, endOfPrefix).join(sep) + append;
}
function common(paths, sep = SEPARATOR) {
	return _common(paths, sep);
}
const regExpEscapeChars = [
	"!",
	"$",
	"(",
	")",
	"*",
	"+",
	".",
	"=",
	"?",
	"[",
	"\\",
	"^",
	"{",
	"|",
];
const rangeEscapeChars = ["-", "\\", "]"];
function _globToRegExp(
	c,
	glob,
	{
		extended = true,
		globstar: globstarOption = true,
		caseInsensitive = false,
	} = {},
) {
	if (glob === "") {
		return /(?!)/;
	}
	let newLength = glob.length;
	for (; newLength > 1 && c.seps.includes(glob[newLength - 1]); newLength--);
	glob = glob.slice(0, newLength);
	let regExpString = "";
	for (let j = 0; j < glob.length; ) {
		let segment = "";
		const groupStack = [];
		let inRange = false;
		let inEscape = false;
		let endsWithSep = false;
		let i = j;
		for (; i < glob.length && !c.seps.includes(glob[i]); i++) {
			if (inEscape) {
				inEscape = false;
				const escapeChars = inRange ? rangeEscapeChars : regExpEscapeChars;
				segment += escapeChars.includes(glob[i]) ? `\\${glob[i]}` : glob[i];
				continue;
			}
			if (glob[i] === c.escapePrefix) {
				inEscape = true;
				continue;
			}
			if (glob[i] === "[") {
				if (!inRange) {
					inRange = true;
					segment += "[";
					if (glob[i + 1] === "!") {
						i++;
						segment += "^";
					} else if (glob[i + 1] === "^") {
						i++;
						segment += "\\^";
					}
					continue;
				} else if (glob[i + 1] === ":") {
					let k = i + 1;
					let value = "";
					while (glob[k + 1] !== undefined && glob[k + 1] !== ":") {
						value += glob[k + 1];
						k++;
					}
					if (glob[k + 1] === ":" && glob[k + 2] === "]") {
						i = k + 2;
						if (value === "alnum") segment += "\\dA-Za-z";
						else if (value === "alpha") segment += "A-Za-z";
						else if (value === "ascii") segment += "\x00-\x7F";
						else if (value === "blank") segment += "\t ";
						else if (value === "cntrl") segment += "\x00-\x1F\x7F";
						else if (value === "digit") segment += "\\d";
						else if (value === "graph") segment += "\x21-\x7E";
						else if (value === "lower") segment += "a-z";
						else if (value === "print") segment += "\x20-\x7E";
						else if (value === "punct") {
							segment += "!\"#$%&'()*+,\\-./:;<=>?@[\\\\\\]^_‘{|}~";
						} else if (value === "space") segment += "\\s\v";
						else if (value === "upper") segment += "A-Z";
						else if (value === "word") segment += "\\w";
						else if (value === "xdigit") segment += "\\dA-Fa-f";
						continue;
					}
				}
			}
			if (glob[i] === "]" && inRange) {
				inRange = false;
				segment += "]";
				continue;
			}
			if (inRange) {
				if (glob[i] === "\\") {
					segment += `\\\\`;
				} else {
					segment += glob[i];
				}
				continue;
			}
			if (
				glob[i] === ")" &&
				groupStack.length > 0 &&
				groupStack[groupStack.length - 1] !== "BRACE"
			) {
				segment += ")";
				const type = groupStack.pop();
				if (type === "!") {
					segment += c.wildcard;
				} else if (type !== "@") {
					segment += type;
				}
				continue;
			}
			if (
				glob[i] === "|" &&
				groupStack.length > 0 &&
				groupStack[groupStack.length - 1] !== "BRACE"
			) {
				segment += "|";
				continue;
			}
			if (glob[i] === "+" && extended && glob[i + 1] === "(") {
				i++;
				groupStack.push("+");
				segment += "(?:";
				continue;
			}
			if (glob[i] === "@" && extended && glob[i + 1] === "(") {
				i++;
				groupStack.push("@");
				segment += "(?:";
				continue;
			}
			if (glob[i] === "?") {
				if (extended && glob[i + 1] === "(") {
					i++;
					groupStack.push("?");
					segment += "(?:";
				} else {
					segment += ".";
				}
				continue;
			}
			if (glob[i] === "!" && extended && glob[i + 1] === "(") {
				i++;
				groupStack.push("!");
				segment += "(?!";
				continue;
			}
			if (glob[i] === "{") {
				groupStack.push("BRACE");
				segment += "(?:";
				continue;
			}
			if (glob[i] === "}" && groupStack[groupStack.length - 1] === "BRACE") {
				groupStack.pop();
				segment += ")";
				continue;
			}
			if (glob[i] === "," && groupStack[groupStack.length - 1] === "BRACE") {
				segment += "|";
				continue;
			}
			if (glob[i] === "*") {
				if (extended && glob[i + 1] === "(") {
					i++;
					groupStack.push("*");
					segment += "(?:";
				} else {
					const prevChar = glob[i - 1];
					let numStars = 1;
					while (glob[i + 1] === "*") {
						i++;
						numStars++;
					}
					const nextChar = glob[i + 1];
					if (
						globstarOption &&
						numStars === 2 &&
						[...c.seps, undefined].includes(prevChar) &&
						[...c.seps, undefined].includes(nextChar)
					) {
						segment += c.globstar;
						endsWithSep = true;
					} else {
						segment += c.wildcard;
					}
				}
				continue;
			}
			segment += regExpEscapeChars.includes(glob[i]) ? `\\${glob[i]}` : glob[i];
		}
		if (groupStack.length > 0 || inRange || inEscape) {
			segment = "";
			for (const c of glob.slice(j, i)) {
				segment += regExpEscapeChars.includes(c) ? `\\${c}` : c;
				endsWithSep = false;
			}
		}
		regExpString += segment;
		if (!endsWithSep) {
			regExpString += i < glob.length ? c.sep : c.sepMaybe;
			endsWithSep = true;
		}
		while (c.seps.includes(glob[i])) i++;
		if (!(i > j)) {
			throw new Error("Assertion failure: i > j (potential infinite loop)");
		}
		j = i;
	}
	regExpString = `^${regExpString}$`;
	return new RegExp(regExpString, caseInsensitive ? "i" : "");
}
const constants = {
	sep: "(?:\\\\|/)+",
	sepMaybe: "(?:\\\\|/)*",
	seps: ["\\", "/"],
	globstar: "(?:[^\\\\/]*(?:\\\\|/|$)+)*",
	wildcard: "[^\\\\/]*",
	escapePrefix: "`",
};
function globToRegExp(glob, options = {}) {
	return _globToRegExp(constants, glob, options);
}
function isGlob(str) {
	const chars = {
		"{": "}",
		"(": ")",
		"[": "]",
	};
	const regex =
		/\\(.)|(^!|\*|\?|[\].+)]\?|\[[^\\\]]+\]|\{[^\\}]+\}|\(\?[:!=][^\\)]+\)|\([^|]+\|[^\\)]+\))/;
	if (str === "") {
		return false;
	}
	let match;
	while ((match = regex.exec(str))) {
		if (match[2]) return true;
		let idx = match.index + match[0].length;
		const open = match[1];
		const close = open ? chars[open] : null;
		if (open && close) {
			const n = str.indexOf(close, idx);
			if (n !== -1) {
				idx = n + 1;
			}
		}
		str = str.slice(idx);
	}
	return false;
}
export { isGlob as isGlob };
function normalizeGlob(glob, { globstar = false } = {}) {
	if (glob.match(/\0/g)) {
		throw new Error(`Glob contains invalid characters: "${glob}"`);
	}
	if (!globstar) {
		return normalize(glob);
	}
	const s = SEPARATOR_PATTERN.source;
	const badParentPattern = new RegExp(
		`(?<=(${s}|^)\\*\\*${s})\\.\\.(?=${s}|$)`,
		"g",
	);
	return normalize(glob.replace(badParentPattern, "\0")).replace(/\0/g, "..");
}
function joinGlobs(globs, { extended = true, globstar = false } = {}) {
	if (!globstar || globs.length === 0) {
		return join(...globs);
	}
	if (globs.length === 0) return ".";
	let joined;
	for (const glob of globs) {
		const path = glob;
		if (path.length > 0) {
			if (!joined) joined = path;
			else joined += `${SEPARATOR}${path}`;
		}
	}
	if (!joined) return ".";
	return normalizeGlob(joined, {
		extended,
		globstar,
	});
}
const mod = {
	basename,
	DELIMITER,
	SEPARATOR,
	SEPARATOR_PATTERN,
	dirname,
	extname,
	format,
	fromFileUrl,
	isAbsolute,
	join,
	normalize,
	parse,
	relative,
	resolve,
	toFileUrl,
	toNamespacedPath,
	common,
	globToRegExp,
	isGlob,
	joinGlobs,
	normalizeGlob,
};
function isPosixPathSeparator1(code) {
	return code === 47;
}
function basename1(path, suffix = "") {
	assertArgs(path, suffix);
	const lastSegment = lastPathSegment(path, isPosixPathSeparator1);
	const strippedSegment = stripTrailingSeparators(
		lastSegment,
		isPosixPathSeparator1,
	);
	return suffix ? stripSuffix(strippedSegment, suffix) : strippedSegment;
}
const DELIMITER1 = ":";
const SEPARATOR1 = "/";
const SEPARATOR_PATTERN1 = /\/+/;
function dirname1(path) {
	assertArg(path);
	let end = -1;
	let matchedNonSeparator = false;
	for (let i = path.length - 1; i >= 1; --i) {
		if (isPosixPathSeparator1(path.charCodeAt(i))) {
			if (matchedNonSeparator) {
				end = i;
				break;
			}
		} else {
			matchedNonSeparator = true;
		}
	}
	if (end === -1) {
		return isPosixPathSeparator1(path.charCodeAt(0)) ? "/" : ".";
	}
	return stripTrailingSeparators(path.slice(0, end), isPosixPathSeparator1);
}
function extname1(path) {
	assertPath(path);
	let startDot = -1;
	let startPart = 0;
	let end = -1;
	let matchedSlash = true;
	let preDotState = 0;
	for (let i = path.length - 1; i >= 0; --i) {
		const code = path.charCodeAt(i);
		if (isPosixPathSeparator1(code)) {
			if (!matchedSlash) {
				startPart = i + 1;
				break;
			}
			continue;
		}
		if (end === -1) {
			matchedSlash = false;
			end = i + 1;
		}
		if (code === 46) {
			if (startDot === -1) startDot = i;
			else if (preDotState !== 1) preDotState = 1;
		} else if (startDot !== -1) {
			preDotState = -1;
		}
	}
	if (
		startDot === -1 ||
		end === -1 ||
		preDotState === 0 ||
		(preDotState === 1 && startDot === end - 1 && startDot === startPart + 1)
	) {
		return "";
	}
	return path.slice(startDot, end);
}
function format1(pathObject) {
	assertArg1(pathObject);
	return _format("/", pathObject);
}
function fromFileUrl1(url) {
	url = assertArg2(url);
	return decodeURIComponent(
		url.pathname.replace(/%(?![0-9A-Fa-f]{2})/g, "%25"),
	);
}
function isAbsolute1(path) {
	assertPath(path);
	return path.length > 0 && isPosixPathSeparator1(path.charCodeAt(0));
}
function normalize1(path) {
	assertArg3(path);
	const isAbsolute = isPosixPathSeparator1(path.charCodeAt(0));
	const trailingSeparator = isPosixPathSeparator1(
		path.charCodeAt(path.length - 1),
	);
	path = normalizeString(path, !isAbsolute, "/", isPosixPathSeparator1);
	if (path.length === 0 && !isAbsolute) path = ".";
	if (path.length > 0 && trailingSeparator) path += "/";
	if (isAbsolute) return `/${path}`;
	return path;
}
function join1(...paths) {
	if (paths.length === 0) return ".";
	let joined;
	for (let i = 0; i < paths.length; ++i) {
		const path = paths[i];
		assertPath(path);
		if (path.length > 0) {
			if (!joined) joined = path;
			else joined += `/${path}`;
		}
	}
	if (!joined) return ".";
	return normalize1(joined);
}
function parse1(path) {
	assertPath(path);
	const ret = {
		root: "",
		dir: "",
		base: "",
		ext: "",
		name: "",
	};
	if (path.length === 0) return ret;
	const isAbsolute = isPosixPathSeparator1(path.charCodeAt(0));
	let start;
	if (isAbsolute) {
		ret.root = "/";
		start = 1;
	} else {
		start = 0;
	}
	let startDot = -1;
	let startPart = 0;
	let end = -1;
	let matchedSlash = true;
	let i = path.length - 1;
	let preDotState = 0;
	for (; i >= start; --i) {
		const code = path.charCodeAt(i);
		if (isPosixPathSeparator1(code)) {
			if (!matchedSlash) {
				startPart = i + 1;
				break;
			}
			continue;
		}
		if (end === -1) {
			matchedSlash = false;
			end = i + 1;
		}
		if (code === 46) {
			if (startDot === -1) startDot = i;
			else if (preDotState !== 1) preDotState = 1;
		} else if (startDot !== -1) {
			preDotState = -1;
		}
	}
	if (
		startDot === -1 ||
		end === -1 ||
		preDotState === 0 ||
		(preDotState === 1 && startDot === end - 1 && startDot === startPart + 1)
	) {
		if (end !== -1) {
			if (startPart === 0 && isAbsolute) {
				ret.base = ret.name = path.slice(1, end);
			} else {
				ret.base = ret.name = path.slice(startPart, end);
			}
		}
		ret.base = ret.base || "/";
	} else {
		if (startPart === 0 && isAbsolute) {
			ret.name = path.slice(1, startDot);
			ret.base = path.slice(1, end);
		} else {
			ret.name = path.slice(startPart, startDot);
			ret.base = path.slice(startPart, end);
		}
		ret.ext = path.slice(startDot, end);
	}
	if (startPart > 0) {
		ret.dir = stripTrailingSeparators(
			path.slice(0, startPart - 1),
			isPosixPathSeparator1,
		);
	} else if (isAbsolute) ret.dir = "/";
	return ret;
}
function resolve1(...pathSegments) {
	let resolvedPath = "";
	let resolvedAbsolute = false;
	for (let i = pathSegments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
		let path;
		if (i >= 0) path = pathSegments[i];
		else {
			const { Deno } = globalThis;
			if (typeof Deno?.cwd !== "function") {
				throw new TypeError("Resolved a relative path without a CWD.");
			}
			path = Deno.cwd();
		}
		assertPath(path);
		if (path.length === 0) {
			continue;
		}
		resolvedPath = `${path}/${resolvedPath}`;
		resolvedAbsolute = isPosixPathSeparator1(path.charCodeAt(0));
	}
	resolvedPath = normalizeString(
		resolvedPath,
		!resolvedAbsolute,
		"/",
		isPosixPathSeparator1,
	);
	if (resolvedAbsolute) {
		if (resolvedPath.length > 0) return `/${resolvedPath}`;
		else return "/";
	} else if (resolvedPath.length > 0) return resolvedPath;
	else return ".";
}
function relative1(from, to) {
	assertArgs1(from, to);
	from = resolve1(from);
	to = resolve1(to);
	if (from === to) return "";
	let fromStart = 1;
	const fromEnd = from.length;
	for (; fromStart < fromEnd; ++fromStart) {
		if (!isPosixPathSeparator1(from.charCodeAt(fromStart))) break;
	}
	const fromLen = fromEnd - fromStart;
	let toStart = 1;
	const toEnd = to.length;
	for (; toStart < toEnd; ++toStart) {
		if (!isPosixPathSeparator1(to.charCodeAt(toStart))) break;
	}
	const toLen = toEnd - toStart;
	const length = fromLen < toLen ? fromLen : toLen;
	let lastCommonSep = -1;
	let i = 0;
	for (; i <= length; ++i) {
		if (i === length) {
			if (toLen > length) {
				if (isPosixPathSeparator1(to.charCodeAt(toStart + i))) {
					return to.slice(toStart + i + 1);
				} else if (i === 0) {
					return to.slice(toStart + i);
				}
			} else if (fromLen > length) {
				if (isPosixPathSeparator1(from.charCodeAt(fromStart + i))) {
					lastCommonSep = i;
				} else if (i === 0) {
					lastCommonSep = 0;
				}
			}
			break;
		}
		const fromCode = from.charCodeAt(fromStart + i);
		const toCode = to.charCodeAt(toStart + i);
		if (fromCode !== toCode) break;
		else if (isPosixPathSeparator1(fromCode)) lastCommonSep = i;
	}
	let out = "";
	for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
		if (i === fromEnd || isPosixPathSeparator1(from.charCodeAt(i))) {
			if (out.length === 0) out += "..";
			else out += "/..";
		}
	}
	if (out.length > 0) return out + to.slice(toStart + lastCommonSep);
	else {
		toStart += lastCommonSep;
		if (isPosixPathSeparator1(to.charCodeAt(toStart))) ++toStart;
		return to.slice(toStart);
	}
}
function toFileUrl1(path) {
	if (!isAbsolute1(path)) {
		throw new TypeError("Must be an absolute path.");
	}
	const url = new URL("file:///");
	url.pathname = encodeWhitespace(
		path.replace(/%/g, "%25").replace(/\\/g, "%5C"),
	);
	return url;
}
function toNamespacedPath1(path) {
	return path;
}
function common1(paths, sep = SEPARATOR1) {
	return _common(paths, sep);
}
const constants1 = {
	sep: "/+",
	sepMaybe: "/*",
	seps: ["/"],
	globstar: "(?:[^/]*(?:/|$)+)*",
	wildcard: "[^/]*",
	escapePrefix: "\\",
};
function globToRegExp1(glob, options = {}) {
	return _globToRegExp(constants1, glob, options);
}
function normalizeGlob1(glob, { globstar = false } = {}) {
	if (glob.match(/\0/g)) {
		throw new Error(`Glob contains invalid characters: "${glob}"`);
	}
	if (!globstar) {
		return normalize1(glob);
	}
	const s = SEPARATOR_PATTERN1.source;
	const badParentPattern = new RegExp(
		`(?<=(${s}|^)\\*\\*${s})\\.\\.(?=${s}|$)`,
		"g",
	);
	return normalize1(glob.replace(badParentPattern, "\0")).replace(/\0/g, "..");
}
function joinGlobs1(globs, { extended = true, globstar = false } = {}) {
	if (!globstar || globs.length === 0) {
		return join1(...globs);
	}
	if (globs.length === 0) return ".";
	let joined;
	for (const glob of globs) {
		const path = glob;
		if (path.length > 0) {
			if (!joined) joined = path;
			else joined += `${SEPARATOR1}${path}`;
		}
	}
	if (!joined) return ".";
	return normalizeGlob1(joined, {
		extended,
		globstar,
	});
}
const mod1 = {
	basename: basename1,
	DELIMITER: DELIMITER1,
	SEPARATOR: SEPARATOR1,
	SEPARATOR_PATTERN: SEPARATOR_PATTERN1,
	dirname: dirname1,
	extname: extname1,
	format: format1,
	fromFileUrl: fromFileUrl1,
	isAbsolute: isAbsolute1,
	join: join1,
	normalize: normalize1,
	parse: parse1,
	relative: relative1,
	resolve: resolve1,
	toFileUrl: toFileUrl1,
	toNamespacedPath: toNamespacedPath1,
	common: common1,
	globToRegExp: globToRegExp1,
	isGlob,
	joinGlobs: joinGlobs1,
	normalizeGlob: normalizeGlob1,
};
const osType = (() => {
	const { Deno } = globalThis;
	if (typeof Deno?.build?.os === "string") {
		return Deno.build.os;
	}
	const { navigator } = globalThis;
	if (navigator?.appVersion?.includes?.("Win")) {
		return "windows";
	}
	return "linux";
})();
const isWindows = osType === "windows";
function basename2(path, suffix = "") {
	return isWindows ? basename(path, suffix) : basename1(path, suffix);
}
export { basename2 as basename };
const DELIMITER2 = isWindows ? ";" : ":";
const SEPARATOR2 = isWindows ? "\\" : "/";
const SEPARATOR_PATTERN2 = isWindows ? /[\\/]+/ : /\/+/;
export { DELIMITER2 as DELIMITER };
export { SEPARATOR2 as SEPARATOR };
export { SEPARATOR_PATTERN2 as SEPARATOR_PATTERN };
function dirname2(path) {
	return isWindows ? dirname(path) : dirname1(path);
}
export { dirname2 as dirname };
function extname2(path) {
	return isWindows ? extname(path) : extname1(path);
}
export { extname2 as extname };
function format2(pathObject) {
	return isWindows ? format(pathObject) : format1(pathObject);
}
export { format2 as format };
function fromFileUrl2(url) {
	return isWindows ? fromFileUrl(url) : fromFileUrl1(url);
}
export { fromFileUrl2 as fromFileUrl };
function isAbsolute2(path) {
	return isWindows ? isAbsolute(path) : isAbsolute1(path);
}
export { isAbsolute2 as isAbsolute };
function join2(...paths) {
	return isWindows ? join(...paths) : join1(...paths);
}
export { join2 as join };
function normalize2(path) {
	return isWindows ? normalize(path) : normalize1(path);
}
export { normalize2 as normalize };
function parse2(path) {
	return isWindows ? parse(path) : parse1(path);
}
export { parse2 as parse };
function relative2(from, to) {
	return isWindows ? relative(from, to) : relative1(from, to);
}
export { relative2 as relative };
function resolve2(...pathSegments) {
	return isWindows ? resolve(...pathSegments) : resolve1(...pathSegments);
}
export { resolve2 as resolve };
function toFileUrl2(path) {
	return isWindows ? toFileUrl(path) : toFileUrl1(path);
}
export { toFileUrl2 as toFileUrl };
function toNamespacedPath2(path) {
	return isWindows ? toNamespacedPath(path) : toNamespacedPath1(path);
}
export { toNamespacedPath2 as toNamespacedPath };
function common2(paths, sep = SEPARATOR2) {
	return _common(paths, sep);
}
export { common2 as common };
function globToRegExp2(glob, options = {}) {
	return options.os === "windows" || (!options.os && isWindows)
		? globToRegExp(glob, options)
		: globToRegExp1(glob, options);
}
export { globToRegExp2 as globToRegExp };
function joinGlobs2(globs, options = {}) {
	return isWindows ? joinGlobs(globs, options) : joinGlobs1(globs, options);
}
export { joinGlobs2 as joinGlobs };
function normalizeGlob2(glob, options = {}) {
	return isWindows
		? normalizeGlob(glob, options)
		: normalizeGlob1(glob, options);
}
export { normalizeGlob2 as normalizeGlob };
export { mod as win32 };
export { mod1 as posix };
