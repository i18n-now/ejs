// mod ext;
use std::path::PathBuf;

use aok::{Null, OK};
use rustyscript::{FsModuleCache, ModuleWrapper, RuntimeOptions};

fn main() -> Null {
  let root: PathBuf = env!("CARGO_MANIFEST_DIR").into();

  let fp = root.join("test.js");
  let fp = fp.as_os_str().to_str().unwrap();

  let mut module = ModuleWrapper::new_from_file(
    fp,
    RuntimeOptions {
      module_cache: Some(Box::new(FsModuleCache::default())),
      // extensions: crate::ext::fs::extensions(),
      ..Default::default()
    },
  )?;

  dbg!(module.keys());

  let value: String = module.get("default")?;
  println!("{}", value);

  // let r = module.call::<String>("abcd", json_args!("The Ultimate Saskatoon Berry Cookbook"))?;
  //
  // dbg!(r);
  // let value: usize =
  //   Runtime::execute_module(&module, vec![], Default::default(), json_args!("test", 5))?;
  //
  // dbg!(value);
  // assert_eq!(value, 2);

  OK
}
