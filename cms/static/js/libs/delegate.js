define(function(){
    return function delegate(node, selector, handler) {
        node.addEventListener("click", function (e) {
            for (var target = e.target; target && target != this; target = target.parentNode) {
                // loop parent nodes from the target to the delegation node
                if (target.matches(selector)) {
                    handler.call(null, target, e);
                    break;
                }
            }

        });
    }
});