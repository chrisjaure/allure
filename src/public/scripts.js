/* global document */

(function() {

	var components = document.querySelectorAll('.allure-component');
	for (var i = 0; i < components.length; i++) {
		addClick(components[i]);
	}

	function addClick (component) {
		component.addEventListener('click', function(e) {
			if (e.target.classList.contains('allure-component-code-toggle')) {
				component.classList.toggle('allure-component-toggled');
			}
		}, false);
	}

})();