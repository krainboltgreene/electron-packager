var path = require('path')
var os = require('os')

var download = require('electron-download')
var extract = require('extract-zip')
var mkdirp = require('mkdirp')
var rimraf = require('rimraf')

var mac = require('./mac.js')
var linux = require('./linux.js')
var win32 = require('./win32.js')

module.exports = function packager (opts, cb) {
  var platformPackager
  var platform = opts.platform
  var arch = opts.arch
  var version = opts.version
  var config = require(path.join(process.cwd(), "package.json")).config

  if (!platform) cb(new Error('Please specify a platform with --platform=, see --help'))
  if (!arch) cb(new Error('Please specify a arch with --arch=, see --help'))
  if (!version) cb(new Error('Please specify an Electron version with --version=, see --help'))
  if (!config) cb(new Error('Please specify a package.json for your app'))

  switch (arch) {
    case 'ia32': break
    case 'x64': break
    default: return cb(new Error('Unsupported arch. Must be either ia32 or x64'))
  }

  switch (platform) {
    case 'darwin': platformPackager = mac; break
    case 'linux': platformPackager = linux; break
    case 'win32': platformPackager = win32; break
    default: return cb(new Error('Unsupported platform. Must be either darwin, linux, or win32'))
  }

  // Only include files specified
  var defaultFiles = ['package.json']
  var files = defaultFiles + config.files
  console.log(files)
  console.log(defaultFiles)
  console.log(config)
  console.log(config.files)
  opts.files = files.prototype.map(function (item) {
    return path.join(opts.dir, item)
  })

  download({
    platform: platform,
    arch: arch,
    version: version
  }, function (err, zipPath) {
    if (err) return cb(err)
    console.error('Packaging app for platform', platform + ' ' + arch, 'using electron v' + version)
    // extract zip into tmp so that packager can use it as a template
    var tmpDir = path.join(os.tmpdir(), 'electron-packager-' + platform + '-template')
    rimraf(tmpDir, function (err) {
      if (err) {} // ignore err
      mkdirp(tmpDir, function (err) {
        if (err) return cb(err)
        extract(zipPath, {dir: tmpDir}, function (err) {
          if (err) return cb(err)
          platformPackager.createApp(opts, tmpDir, cb)
        })
      })
    })
  })
}
