'use strict';

angular.module('deckApp.pipelines.stage.resizeAsg')
  .config(function(pipelineConfigProvider) {
    pipelineConfigProvider.registerStage({
      label: 'Resize ASG',
      description: 'Resizes an ASG',
      key: 'resizeAsg',
      controller: 'ResizeAsgStageCtrl',
      controllerAs: 'resizeAsgStageCtrl',
      templateUrl: 'scripts/modules/pipelines/config/stages/resizeAsg/resizeAsgStage.html',
      executionDetailsUrl: 'scripts/modules/pipelines/config/stages/resizeAsg/resizeAsgExecutionDetails.html',
      executionTaskLabelUrl: 'scripts/modules/pipelines/config/stages/resizeAsg/resizeAsgTaskLabel.html',
    });
  }).controller('ResizeAsgStageCtrl', function($scope, stage, accountService) {

    var ctrl = this;

    $scope.stage = stage;

    $scope.state = {
      accounts: false
    };

    accountService.listAccounts().then(function (accounts) {
      $scope.accounts = accounts;
      $scope.state.accounts = true;
    });

    $scope.regions = ['us-east-1', 'us-west-1', 'eu-west-1', 'us-west-2'];
    $scope.regionsLoaded = false;

    ctrl.accountUpdated = function() {
      accountService.getRegionsForAccount($scope.stage.credentials).then(function(regions) {
        $scope.regions = _.map(regions, function(v) { return v.name; });
        $scope.regionsLoaded = true;
      });
    };

    ctrl.toggleRegion = function(region) {
      var idx = $scope.stage.regions.indexOf(region);
      if (idx > -1) {
        $scope.stage.regions.splice(idx,1);
      } else {
        $scope.stage.regions.push(region);
      }
    };

    $scope.resizeTargets = [
      {
        label: 'Current ASG',
        val: 'current_asg'
      },
      {
        label: 'Last ASG',
        val: 'ancestor_asg'
      }
    ];

    $scope.scaleActions = [
      {
        label: 'Scale Up',
        val: 'scale_up',
      },
      {
        label: 'Scale Down',
        val: 'scale_down'
      }
    ];

    $scope.resizeTypes = [
      {
        label: 'Percentage',
        val: 'pct'
      },
      {
        label: 'Incremental',
        val: 'incr'
      },
      {
        label: 'Exact',
        val: 'exact'
      }
    ];

    (function() {
      if (!$scope.stage.capacity) {
        $scope.stage.capacity = {};
      }
      if (!$scope.stage.regions) {
        $scope.stage.regions = [];
      }
      if ($scope.stage.credentials) {
        ctrl.accountUpdated();
      }
      if (!$scope.stage.target) {
        $scope.stage.target = $scope.resizeTargets[0].val;
      }
      if (!$scope.stage.action) {
        $scope.stage.action = $scope.scaleActions[0].val;
      }
      if (!$scope.stage.resizeType) {
        $scope.stage.resizeType = $scope.resizeTypes[0].val;
      }
    })();


    ctrl.updateCapacity = function() {
      $scope.stage.capacity.desired = $scope.stage.capacity.max;
    };

    ctrl.updateResizeType = function() {
      $scope.stage.capacity = {};
      delete $scope.stage.scalePct;
      delete $scope.stage.scaleNum;
    };

  });

