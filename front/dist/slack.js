// Generated by CoffeeScript 1.8.0
(function() {
  var SlackAdmin, SlackWebhooksDirective, debounce, initSlackPlugin, module, slackInfo;

  this.taigaContribPlugins = this.taigaContribPlugins || [];

  slackInfo = {
    slug: "slack",
    name: "Slack",
    type: "admin",
    module: 'taigaContrib.slack'
  };

  this.taigaContribPlugins.push(slackInfo);

  module = angular.module('taigaContrib.slack', []);

  debounce = function(wait, func) {
    return _.debounce(func, wait, {
      leading: true,
      trailing: false
    });
  };

  initSlackPlugin = function($tgUrls) {
    return $tgUrls.update({
      "slack": "/slack"
    });
  };

  SlackAdmin = (function() {
    SlackAdmin.$inject = ["$rootScope", "$scope", "$tgRepo", "$appTitle", "$tgConfirm"];

    function SlackAdmin(rootScope, scope, repo, appTitle, confirm) {
      this.rootScope = rootScope;
      this.scope = scope;
      this.repo = repo;
      this.appTitle = appTitle;
      this.confirm = confirm;
      this.scope.sectionName = "Slack";
      this.scope.sectionSlug = "slack";
      this.scope.$on("project:loaded", (function(_this) {
        return function() {
          var promise;
          promise = _this.repo.queryMany("slack", {
            project: _this.scope.projectId
          });
          promise.then(function(slackhooks) {
            _this.scope.slackhook = {
              project: _this.scope.projectId
            };
            if (slackhooks.length > 0) {
              _this.scope.slackhook = slackhooks[0];
            }
            return _this.appTitle.set("Slack - " + _this.scope.project.name);
          });
          return promise.then(null, function() {
            return _this.confirm.notify("error");
          });
        };
      })(this));
    }

    return SlackAdmin;

  })();

  module.controller("ContribSlackAdminController", SlackAdmin);

  SlackWebhooksDirective = function($repo, $confirm, $loading) {
    var link;
    link = function($scope, $el, $attrs) {
      var form, submit, submitButton;
      form = $el.find("form").checksley({
        "onlyOneErrorElement": true
      });
      submit = debounce(2000, (function(_this) {
        return function(event) {
          var promise;
          event.preventDefault();
          if (!form.validate()) {
            return;
          }
          $loading.start(submitButton);
          if ($scope.slackhook.id) {
            promise = $repo.save($scope.slackhook);
          } else {
            promise = $repo.create("slack", $scope.slackhook);
          }
          promise.then(function() {
            $loading.finish(submitButton);
            return $confirm.notify("success");
          });
          return promise.then(null, function(data) {
            $loading.finish(submitButton);
            form.setErrors(data);
            if (data._error_message) {
              return $confirm.notify("error", data._error_message);
            }
          });
        };
      })(this));
      submitButton = $el.find(".submit-button");
      $el.on("submit", "form", submit);
      return $el.on("click", ".submit-button", submit);
    };
    return {
      link: link
    };
  };

  module.directive("contribSlackWebhooks", ["$tgRepo", "$tgConfirm", "$tgLoading", SlackWebhooksDirective]);

  module.run(["$tgUrls", initSlackPlugin]);

  module.run([
    '$templateCache', function($templateCache) {
      return $templateCache.put('contrib/slack', '<div contrib-slack-webhooks="contrib-slack-webhooks" ng-controller="ContribSlackAdminController as ctrl"><header><h1 tg-main-title="tg-main-title"></h1></header><form><fieldset><label for="url">Slack webhook url</label><input type="text" name="url" ng-model="slackhook.url" placeholder="Slack webhook url" id="url"/></fieldset><button type="submit" class="hidden"></button><a href="" title="Save" ng-click="ctrl.updateOrCreateHook(slackhook)" class="button button-green submit-button">Save</a></form></div>');
    }
  ]);

}).call(this);
