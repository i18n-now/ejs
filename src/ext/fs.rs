use std::{borrow::Cow, path::Path};

use rustyscript::deno_core::Extension;

pub struct Permissions {}

impl deno_fs::FsPermissions for Permissions {
  fn check_open<'a>(
    &mut self,
    _resolved: bool,
    _read: bool,
    _write: bool,
    path: &'a Path,
    _api_name: &str,
  ) -> Result<Cow<'a, Path>, deno_io::fs::FsError> {
    Ok(Cow::Borrowed(path))
  }

  fn check_read(&mut self, _: &std::path::Path, _: &str) -> std::result::Result<(), aok::Error> {
    Ok(())
  }
  fn check_read_all(&mut self, _: &str) -> std::result::Result<(), aok::Error> {
    Ok(())
  }
  fn check_read_blind(
    &mut self,
    _: &std::path::Path,
    _: &str,
    _: &str,
  ) -> std::result::Result<(), aok::Error> {
    Ok(())
  }
  fn check_write(&mut self, _: &std::path::Path, _: &str) -> std::result::Result<(), aok::Error> {
    Ok(())
  }
  fn check_write_partial(
    &mut self,
    _: &std::path::Path,
    _: &str,
  ) -> std::result::Result<(), aok::Error> {
    Ok(())
  }
  fn check_write_all(&mut self, _: &str) -> std::result::Result<(), aok::Error> {
    Ok(())
  }
  fn check_write_blind(
    &mut self,
    _: &std::path::Path,
    _: &str,
    _: &str,
  ) -> std::result::Result<(), aok::Error> {
    Ok(())
  }
}

pub fn extensions() -> Vec<Extension> {
  let fs = std::rc::Rc::new(deno_fs::RealFs);
  vec![
    deno_io::deno_io::init_ops_and_esm(Default::default()),
    deno_fs::deno_fs::init_ops_and_esm::<Permissions>(fs.clone()),
    super::init_fs::init_fs::init_ops_and_esm(),
  ]
}
