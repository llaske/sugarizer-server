export { getLogin } from './getLogin';
export { login } from './login';
export { logout } from './logout';
export { postLogin } from './postLogin';
export { signup } from './signup';
export { updateTimestamp } from './updateTimestamp';
export { validateSession } from './validateSession';
export { validateUser } from './validateUser';


// init settings
var ini = null;
exports.init = function(settings) {
	ini = settings;
}
