function Fn() {

}

Fn.prototype = {
	constructor: Fn,

	/**
	 * either:
	 *  this function should be overridden by anyone extending this class (that's the point)
	 *  or
	 *  we rewrite this function to evaluate the function text a user inputs
	 *
	 * entity: a character to consider when evaluating this function
	 * userInputs: user-defined independent variables (like the Power Attack amount)
	 */
	evaluate: function(entity, userInputs = []) {
		return 0;
	}
}



/**
 * amount: Fn describing the amount of the modification
 * type: dodge/racia/circumstance/enhancement/untyped/etc
 * toModify: array of strings describing what to modify
 */
function NumericalFxPart(amount, type, toModify) {
	this.amount = amount;
	this.type = type;
	this.toModify = toModify;
}

NumericalFxPart.prototype = {
	constructor: NumericalFxPart,

	debugPrint: function() {
		console.log(this);
	}
}



/**
 * type: senses/condition/SQ/etc
 * baseText: text of the effect with $-sigiled variables
 * params: map of {name -> fn}
 */
function TextualFxPart(type, baseText, params) {
	this.type = type;
	this.baseText = baseText;
	this.setParams(params);
}

TextualFxPart.prototype = {
	constructor: TextualFxPart,

	setParams: function(newParams) {
		this.paramNames = newParams.keys().sort(function(x, y) {
			return x.length - y.length;
		});
		this.params = newParams;
	}

	generateText: function() {
		var ret = this.baseText;
		for(paramName of paramNames) {
			ret = ret.split(paramName).join(this.params[paramName].evaluate());
		}
	}

	debugPrint: function() {
		console.log(this);
	}
}



function Effect(on, numericalParts, textualParts) {
	this.on = on;
	this.numericalParts = numericalParts;
	this.textualParts = textualParts;
}

Effect.prototype = {
	constructor: Effect,

	debugPrint: function() {
		console.log(this);
	}
}



// todo: let the user override this
stackableTypes = ["circumstance", "dodge", "racial", "untyped"];

// returns {toModify: {type: amount}}
aggregateEffects = function(entity, effects) {
	ret = {}
	modifications = {}; // {toModify: {type: [amounts as ints]}}

	for(effect of effects) {
		for(part of effect.numericalParts) {
			var modifier = part.amount.evaluate();
			var stackable = (part.type in stackableTypes);
			for(stat of part.toModify) {
				if(stackable) {
					// no need to do complicated aggregation for effects that stack
					// so just add it to the return value
					ret[stat] = (ret[stat] || 0) + modifier;
				} else {
					var modificationMapping = modifications[part.toModify] || {};
					var typeMapping = modificationMapping[part.type] || {};
					typeMapping.push(modifier);
					modificationMapping[part.type] = typeMapping;
					modifications[part.toModify] = modificationMapping;
				}
			} // stats in part.toModify
		} // numerical parts
	} // effects

	for(stat in modifications) {
		for(type in modifications[stat]) {
			modifiers = modifications[stat][type];
			ret[stat][type] =
				Math.min(0, Math.max(...modifiers)) + // maximum bonus (0 if no bonuses)
				Math.max(0, Math.min(...modifiers));  // worst penalty (0 if no penalties)
		}
	}

	return ret;
}
