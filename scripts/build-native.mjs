#!/usr/bin/env zx



// let rootDir = await path.resolve(__dirname, '..');
// let buildDir = await path.join(rootDir, 'native', 'build', 'scripted');

// echo(`Root directory: ${rootDir}`);
// echo(`Build directory: ${buildDir}`);

// // Clean the build directory before we build
// await fs.remove(buildDir);
// await fs.ensureDir(buildDir);

// cd(buildDir);

// let buildType = argv.dev ? 'Debug' : 'Release';
// let devFlag = argv.dev ? '-DELEM_DEV_LOCALHOST=1' : '';

// await $`cmake -DCMAKE_BUILD_TYPE=${buildType} -DCMAKE_INSTALL_PREFIX=./out/ -DCMAKE_OSX_DEPLOYMENT_TARGET=10.15 ${devFlag} ../..`;
// await $`cmake --build . --config ${buildType} -j 4`;



let rootDir = await path.resolve(__dirname, '..');
let buildDir = await path.join(rootDir, 'native', 'build', 'scripted');

echo(`Root directory: ${rootDir}`);
echo(`Build directory: ${buildDir}`);

// Only clean if --clean flag is passed
if (argv.clean) {
  echo('Cleaning build directory...');
  await fs.remove(buildDir);
}

await fs.ensureDir(buildDir);
cd(buildDir);

let buildType = argv.dev ? 'Debug' : 'Release';
let devFlag = argv.dev ? '-DELEM_DEV_LOCALHOST=1' : '';

// Only run cmake configuration if build directory is empty or --clean was used
if (argv.clean || !(await fs.pathExists('CMakeCache.txt'))) {
  await $`cmake -DCMAKE_BUILD_TYPE=${buildType} -DCMAKE_INSTALL_PREFIX=./out/ -DCMAKE_OSX_DEPLOYMENT_TARGET=10.15 ${devFlag} ../..`;
}

// Use available CPU cores for parallel builds
const cpuCount = os.cpus().length;
try {
  await $`cmake --build . --config ${buildType} -j ${cpuCount}`;
  
  // If build was successful, open the program
  const executablePath = path.join(buildDir,"ARP_artefacts", buildType, 'Standalone/ARP.app/Contents/MacOS/ARP')
  echo('Build successful! Opening program...');
  await $`${executablePath}`;
} catch (error) {
  echo('Build failed:', error.message);
  process.exit(1);
}