import * as user from './controllers/user';
import * as movie from './controllers/movie';
import * as authentication from './controllers/authentication';
import * as picture from './controllers/picture';
import * as search from './controllers/search';
import * as comment from './controllers/comment';
import * as genre from './controllers/scraper/genreCount';
import * as video from './controllers/video';
import deleteAll from './controllers/video/deleter';

const routes = async (app, passport, upload) => {
  /**
   * Primary app routes.
   */
  app.post('/api/signin', authentication.local);
  app.post('/api/signup/info', user.postSignup);
  app.post('/api/signup/upload', upload.single('imageUploaded'), picture.postSignupPicture);
  app.post('/api/forgot', user.postForgot);
  app.post('/api/reset/:token', user.postReset);

  app.get('/api/movie/stream/:idImdb/:hash', video.checker, video.torrenter, video.streamer);
  app.get('/api/movie/subtitle/:idImdb/:hash', video.getSub);
  app.get('/api/movie/clearAll', deleteAll);

  // Logged part  ====================
  app.use(passport.authenticate('jwt', { session: false }));

  app.get('/api/me', user.getMyAccount);
  app.post('/api/me', user.postUpdateProfile);
  app.delete('/api/me', user.deleteDeleteAccount); // not implemented
  // app.post('/api/me/password', user.postUpdatePassword);
  app.post('/api/profile_pic', upload.single('imageUploaded'), picture.newPicture);
  app.get('/api/profile/:name', user.getAccount);
  app.get('/api/profile/id/:id', user.getAccountById);
  app.get('/api/movie/info/:idImdb', movie.getInfos);

  app.get('/api/comment/:idImdb', comment.getComment);
  app.post('/api/comment/:idImdb', comment.addComment);

  app.get('/api/genres', genre.getGenreTable);

  app.get('/api/gallery/search', search.getSearch);

  /**
   * OAuth authentication routes. (Sign in)
   */
  app.get('/api/auth/fortytwo', passport.authenticate('42'));
  app.get('/api/auth/fortytwo/callback', authentication.fortytwo);
  app.get('/api/auth/google', passport.authenticate('google', { scope: 'profile email' }));
  app.get('/api/auth/google/callback', authentication.google);
};

export default routes;
