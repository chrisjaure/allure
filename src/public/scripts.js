/* global jQuery */

jQuery.noConflict();
jQuery(function($) {
	$('.allure-component').on('click', '.allure-component-code-toggle', function(e) {
		$(e.delegateTarget).toggleClass('allure-component-toggled');
	});
});