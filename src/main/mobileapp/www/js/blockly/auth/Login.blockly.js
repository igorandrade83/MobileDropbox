window.blockly = window.blockly || {};
window.blockly.js = window.blockly.js || {};
window.blockly.js.blockly = window.blockly.js.blockly || {};
window.blockly.js.blockly.auth = window.blockly.js.blockly.auth || {};
window.blockly.js.blockly.auth.Login = window.blockly.js.blockly.auth.Login
		|| {};

/**
 * Login
 */
window.blockly.js.blockly.auth.Login.login = function(login, password, options) {
	var item;
	this.cronapi.screen.showLoading();
	if (!this.cronapi.logic.isNullOrEmpty(this.cronapi.screen.getHostapp())) {
		this.cronapi.util
				.getURLFromOthers(
						'POST',
						'application/x-www-form-urlencoded',
						String(this.cronapi.screen.getHostapp())
								+ String('auth'),
						this.cronapi.object.createObjectFromString([
								'{ \"username\": \"', login,
								'\" , \"password\": \"', password, '\" } ']
								.join('')),
						null,
						function(sender_item) {
							item = sender_item;
							this.cronapi.screen.hide();
							this.cronapi.util.setLocalStorage('_u',
									this.cronapi.object.serializeObject(item));
							this.cronapi.screen.changeView("#/app/logged/home",
									[]);
						}.bind(this),
						function(sender_item) {
							item = sender_item;
							if (this.cronapi.object.getProperty(item, 'status') == '403'
									|| this.cronapi.object.getProperty(item,
											'status') == '401') {
								this.cronapi.screen
										.notify(
												'error',
												this.cronapi.i18n
														.translate(
																"Login.view.invalidPassword",
																[]));
							} else {
								this.cronapi.screen.notify('error',
										this.cronapi.object.getProperty(item,
												'responseJSON.message'));
							}
							this.cronapi.screen.hide();
						}.bind(this));
	} else {
		this.cronapi.screen.hide();
		this.cronapi.screen.notify('error', 'HostApp is Required');
	}
}
