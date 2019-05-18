window.blockly = window.blockly || {};
window.blockly.js = window.blockly.js || {};
window.blockly.js.blockly = window.blockly.js.blockly || {};
window.blockly.js.blockly.auth = window.blockly.js.blockly.auth || {};
window.blockly.js.blockly.auth.ChangePassword = window.blockly.js.blockly.auth.ChangePassword || {};

/**
 * ChangePassword
 */
window.blockly.js.blockly.auth.ChangePassword.openModal = function() {
 var item, confirmationPassword, newPasswordConfirmation, oldPassword;
  this.cronapi.screen.showIonicModal("changePassword");
}

/**
 * Descreva esta função...
 */
window.blockly.js.blockly.auth.ChangePassword.changePassword = function() {
 var item, confirmationPassword, newPasswordConfirmation, oldPassword;
  if (this.cronapi.screen.getValueOfField("vars.newPassword") == this.cronapi.screen.getValueOfField("vars.confirmationPassword")) {
    oldPassword = this.cronapi.screen.getValueOfField("vars.oldPassword");
    confirmationPassword = this.cronapi.screen.getValueOfField("vars.newPassword");
    newPasswordConfirmation = this.cronapi.screen.getValueOfField("vars.confirmationPassword");
    this.cronapi.screen.showLoading();
    if (!this.cronapi.logic.isNullOrEmpty(this.cronapi.screen.getHostapp())) {
      this.cronapi.util.getURLFromOthers('POST', 'application/x-www-form-urlencoded', String(this.cronapi.screen.getHostapp()) + String('changePassword'), this.cronapi.object.createObjectFromString(['{ \"oldPassword\": \"',oldPassword,'\" , \"newPassword\": \"',confirmationPassword,'\" , \"newPasswordConfirmation\": \"',newPasswordConfirmation,'\" } '].join('')), this.cronapi.object.createObjectFromString(['{ \"X-AUTH-TOKEN\": \"',this.cronapi.util.getUserToken(),'\" } '].join('')), function(sender_item) {
          item = sender_item;
        this.cronapi.screen.hide();
        this.cronapi.screen.notify('info',this.cronapi.i18n.translate("Home.view.passwordChanged",[  ]));
        this.blockly.js.blockly.auth.ChangePassword.closeModal();
      }.bind(this), function(sender_item) {
          item = sender_item;
        if (this.cronapi.object.getProperty(item, 'status') == '403' || this.cronapi.object.getProperty(item, 'status') == '401') {
          this.cronapi.screen.notify('error',this.cronapi.i18n.translate("Login.view.invalidPassword",[  ]));
        } else {
          this.cronapi.screen.notify('error',this.cronapi.object.getProperty(item, 'responseJSON.message'));
        }
        this.cronapi.screen.hide();
      }.bind(this));
    } else {
      this.cronapi.screen.hide();
      this.cronapi.screen.notify('error','HostApp is Required');
    }
  } else {
    this.cronapi.screen.notify('error',this.cronapi.i18n.translate("Login.view.invalidPassword",[  ]));
  }
}

/**
 * Descreva esta função...
 */
window.blockly.js.blockly.auth.ChangePassword.closeModal = function() {
 var item, confirmationPassword, newPasswordConfirmation, oldPassword;
  this.cronapi.screen.hideIonicModal("changePassword");
}
