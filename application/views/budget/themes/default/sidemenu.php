<!DOCTYPE html>
<html lang="pt-BR">

    <head>

        <meta charset="iso-8859-1">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="description" content="">
        <meta name="author" content="">

        <title>MIMV</title>

        <!-- Bootstrap Core CSS -->
        <link href="<?= base_url() ?>assets/admin/css/bootstrap.min.css" rel="stylesheet">

        <!-- MetisMenu CSS -->
        <link href="<?= base_url() ?>assets/admin/css/metisMenu.min.css" rel="stylesheet">

        <!-- Custom CSS -->
        <link href="<?= base_url() ?>assets/admin/css/sb-admin-2.css" rel="stylesheet">

		<!-- CSS do APP -->
        <link href="<?= base_url() ?>assets/budget/css/app-budget.css" rel="stylesheet">
		
        <!-- Custom Fonts -->
        <link href="<?= base_url() ?>assets/admin/css/font-awesome.min.css" rel="stylesheet" type="text/css">
		<link href="<?= base_url() ?>assets/budget/css/select2.min.css" rel="stylesheet">
		<link href="https://fonts.googleapis.com/css?family=Lato" rel="stylesheet">

		<!-- Bootstrap Tables -->
		<link href="<?= base_url() ?>assets/budget/css/bootstrap-table.min.css" rel="stylesheet">
		
		<!-- Bootstrap Date-->
		<link href="<?= base_url() ?>assets/budget/css/bootstrap-datepicker.css" rel="stylesheet">
		
		<!-- jquery-filer -->
		<link href="<?= base_url() ?>assets/budget/css/jquery.filer.css" rel="stylesheet">
        <!-- HTML5 Shim and Respond.js IE8 support of HTML5 elements and media queries -->
        <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
        <!--[if lt IE 9]>
<script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
<script src="https://oss.maxcdn.com/libs/respond.js/1.4.2/respond.min.js"></script>
<![endif]-->

	</head>

    <body>
        <div id="wrapper">
		    <!-- Navigation -->
                <div class="navbar-default sidebar" role="navigation">
                    <div class="sidebar-nav navbar-collapse">
                        <ul class="nav" id="side-menu">
							<div class="dropdown meuBudget" style="padding: 3px 20px; margin-left:0px; z-index:3000;">
								<a class="dropdown-toggle" data-toggle="dropdown">
									<h4><?=$this->profile->nome?> <i class="fa fa-caret-down"></i></h4>
								</a>
								<ul class="dropdown-menu">
									<li class="semBorda"><a href="<?= base_url('profiles') ?>"><i class="fa fa-exchange fa-fw"></i><?=lang('sidemenu_profile_change');?></a></li>
									<li style="display:none" class="semBorda"><a href="<?= base_url('profiles/novo/'.$this->profile->uniqueid) ?>"><i class="fa fa-leaf fa-fw"></i><?=lang('sidemenu_profile_newbegin');?></a></li>
									<li role="separator" class="divider"></li>
									<li class="semBorda"><a href="<?= base_url('user') ?>"><i class="fa fa-cog fa-fw"></i><?=lang('sidemenu_profile_edit');?></a></li>
									<li class="semBorda"><a href="<?= base_url('auth/logout') ?>"><i class="fa fa-sign-out fa-fw"></i><?=lang('sidemenu_profile_logout');?></a></li>
								</ul>
							</div>
							
							<li><a href="<?= base_url($this->profile->uniqueid.'/accounts') ?>"><i class="fa fa-university fa-fw"></i> <?=lang('sidemenu_links_accounts');?></a></li>
                            <li><a href="<?= base_url($this->profile->uniqueid.'/budget') ?>"><i class="fa fa-pie-chart fa-fw"></i> <?=lang('sidemenu_links_budgets');?></a></li>
							<hr>
							<?php $this->load->view($this->config->item('ci_budget_template_dir_admin') . 'sidemenu_exibeContas'); ?>
                            <hr>
							<?php if ($this->is_admin): ?>
                            <li><a href="<?= base_url('budget/users') ?>"><i class="fa fa-edit fa-fw"></i> Users</a></li>
                            <?php endif; ?>
						</ul>
					</div>
                    <!-- /.sidebar-collapse -->
					
                </div>
                <!-- /.navbar-static-side -->