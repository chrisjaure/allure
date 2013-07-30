/* global document */

(function() {

	var components = document.querySelectorAll('.allure-component');
	for (var i = 0; i < components.length; i++) {
		addClick(components[i]);
	}

	function addClick (component) {
		component.addEventListener('click', function() {
			component.classList.toggle('allure-component-toggled');
		}, false);
	}

})();