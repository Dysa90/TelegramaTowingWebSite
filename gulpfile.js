import gulp from 'gulp';
const { series, parallel, src, dest, watch, task } = gulp;
import plumber from 'gulp-plumber';
import autoprefixer from 'gulp-autoprefixer';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
const sass = gulpSass(dartSass);
import rename from 'gulp-rename';
import sourcemaps from 'gulp-sourcemaps';
import browserSync from 'browser-sync';

import { deleteAsync as del } from 'del';

// Rutas de los archivos y carpetas
const paths = {
  bootstrap: {
    scss: "./node_modules/bootstrap/scss/**/*",
    js: "./node_modules/bootstrap/dist/js/**/*", 
    dest: "./src/assets/scss"
  },
  
  custom: {
    scss: "src/assets/scss/theme.scss",
    dest: "./dist/css" 
  },
  compile: {
    scss: "./assets/bootstrap/scss/bootstrap.scss",
    dest: "./dist/css"
  },
  generated:{
    css:"./dist/css",
    clean:['./dist/css']
  },
  watch:{
    scss:["src/assets/scss/*.scss", "src/assets/scss/**/*.scss"],
    html:["./*.html"],
    images:["src/assets/images/**/*.*"]
  },
  pages:{
    site:"./",
    index:"./index.html"
  },
  rellax:{
    from: ['src/assets/images/**/*.*', 'src/assets/images/*.*'],
    to: './dist/assets/images',
  },
  images: {
    from: ['./node_modules/rellax/rellax.min.js'],
    to: './dist/assets/js',
}

};

// Tarea para mover los archivos SCSS y JS de Bootstrap a la carpeta del proyecto
gulp.task("move-bootstrap-files", function () {
  // Mover los archivos SCSS
  const moveScss = gulp
    .src(paths.bootstrap.scss)
    .pipe(gulp.dest(`${paths.bootstrap.dest}/bootstrap`));

  return Promise.all([moveScss]); // Asegura que ambas tareas se completen
});
gulp.task("move-js-files", function () {
  
  const moveRellax = gulp
    .src(paths.rellax.scss)
    .pipe(gulp.dest(`${paths.bootstrap.dest}/bootstrap`));

  return Promise.all([moveScss]); // Asegura que ambas tareas se completen
});

gulp.task("move-images", function () {
  // Mover los archivos SCSS
  const moveImg = gulp
    .src(paths.images.from)
    .pipe(gulp.dest(`${paths.images.to}`));

  return Promise.all([moveImg]); 
});

// Tarea para compilar el SCSS de Bootstrap (sin personalizar)
// gulp.task("compile-bootstrap", function () {
//   return gulp
//     .src(paths.compile.scss)
//     .pipe(sass().on("error", sass.logError)) // Compila SCSS a CSS
//     .pipe(cleanCSS()) // Minifica el CSS
//     .pipe(rename({ suffix: ".min" })) // Agrega el sufijo ".min"
//     .pipe(gulp.dest(paths.compile.dest)); // Guarda el resultado en la carpeta destino
// });

// Tarea para compilar el theme personalizado
gulp.task('compile-theme',(cb)=>{
  src(paths.custom.scss)
      .pipe(plumber())
      .pipe(sourcemaps.init())
      .pipe(sass().on('error', sass.logError))
      .pipe(dest(paths.generated.css))
      .pipe(sass({ outputStyle: 'compressed'}).on('error', sass.logError))
      .pipe(autoprefixer({cascade: false}))
      .pipe(plumber.stop())              
      .pipe(rename({ suffix: '.min' }))       
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest(paths.custom.dest))
      .pipe(browserSync.reload({ stream: true }));  
      cb();
});

gulp.task('serve',(cb)=>{
    browserSync.init({
        server: {
            baseDir: paths.pages.site,
            index: paths.pages.index
        },
        // proxy: '127.0.0.1:8010',
        port: 3002,
        open: true,
        notify: false,
    });
    cb();
});

gulp.task('watcher',(cb)=>{ 
     watch(paths.watch.scss, series('compile-theme'));    
     watch(paths.watch.html, browserSync.reload({ stream: true }));  
    cb();
});

gulp.task('clean', (cb) => {
    return del(paths.generated.clean, { read: false });
  });

// Tarea por defecto que mueve los archivos, compila Bootstrap y luego compila el theme
gulp.task(
  "move",
  gulp.series("move-bootstrap-files")
);
gulp.task(
  "default",
  gulp.series("clean","compile-theme","move-images", parallel('serve','watcher'))
);