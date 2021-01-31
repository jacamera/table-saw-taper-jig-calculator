interface FractionalUnit {
	decimalValue: number,
	numerator: number
}

type RoundMethod = 'up' | 'down';

const textInputs = {
	jigLength: document.getElementById('jig-length') as HTMLInputElement,
	jigWidth: document.getElementById('jig-width') as HTMLInputElement,
	cutTop: document.getElementById('cut-top') as HTMLInputElement,
	cutBottom: document.getElementById('cut-bottom') as HTMLInputElement,
	cutLength: document.getElementById('cut-length') as HTMLInputElement,
	roundingDivisions: document.getElementById('round-denominator') as HTMLInputElement
} as { [key: string]: HTMLInputElement };

const
	roundMethodSelectList = document.getElementById('round-method') as HTMLSelectElement,
	jigSpreadOutputTextInput = document.getElementById('jig-spread') as HTMLInputElement,
	fencePositionOutputTextInput = document.getElementById('fence-position') as HTMLInputElement;

const fractionRegex = /\d+\s*\/\s*\d+/;

function decimalToFraction(decimal: number, divisions: number, roundMethod: RoundMethod) {
	const remainder = decimal % 1;
	if (remainder !== 0) {
		const fractions = new Array(divisions)
			.fill(undefined)
			.map((_, i) => {
				const value = i + 1;
				return {
					decimalValue: value / divisions,
					numerator: value
				};
			});
		let fraction: FractionalUnit;
		if (roundMethod === 'up') {
			fraction = fractions.find(fraction => fraction.decimalValue >= remainder);
		} else {
			fraction = fractions
				.reverse()
				.find(fraction => fraction.decimalValue <= remainder);
		}
		if (fraction) {
			let result = '';
			const wholePart = decimal - remainder;
			if (wholePart) {
				result += wholePart + ' ';
			}
			const reducedFraction = reduceFraction(fraction.numerator, divisions);
			return result + `${reducedFraction[0]}/${reducedFraction[1]}`;
		}
	}
	return decimal.toString();
}

function fractionToDecimal(fraction: string) {
	const fractionParts = fraction.split(/\s*\/\s*/);
	return parseInt(fractionParts[0], 10) / parseInt(fractionParts[1], 10);
}

function parseInputValues() {
	return Object
		.keys(textInputs)
		.reduce((result, key) => {
			result[key] = textInputs[key].value
				.split(/\s+/)
				.reduce((result, part) => {
					let fractionMatch: RegExpMatchArray;
					if (fractionMatch = part.match(/(\d+)\s*\/\s*(\d+)/)) {
						return result += (parseInt(fractionMatch[1], 10) / parseInt(fractionMatch[2], 10));
					} else {
						return result += parseFloat(part);
					}
				}, 0);
			return result;
		}, {} as {
			jigLength: number,
			jigWidth: number,
			cutTop: number,
			cutBottom: number,
			cutLength: number,
			roundingDivisions: number | null
		});
}

function reduceFraction(numerator: number, denominator: number) {
	for (var i = numerator; i > 0; i--) {
		if (numerator % i === 0 && denominator % i === 0) {
			return [numerator / i, denominator / i];
		}
	}
	return [numerator, denominator];
}

document
	.getElementById('calculate')
	.addEventListener('click', event => {
		event.preventDefault();
		const { jigLength, jigWidth, cutTop, cutBottom, cutLength, roundingDivisions } = parseInputValues();
		const
			jigAngle = Math.atan((cutTop - cutBottom) / cutLength),
			jigSpread = Math.sin(jigAngle / 2) * jigLength * 2,
			jigLegToBladeWidth = cutTop / Math.cos(jigAngle),
			jigSwingLegWidth = (jigWidth / 2) / Math.cos(jigAngle),
			jigSpreadOffsetWidth = Math.sin(jigAngle) * (jigLength - cutLength - (Math.tan(jigAngle) * cutTop) - (Math.tan(jigAngle) * (jigWidth / 2))),
			fencePosition = (jigWidth / 2) + jigSpreadOffsetWidth + jigSwingLegWidth + jigLegToBladeWidth;
		let
			jigSpreadOutputValue: string,
			fencePositionOutputValue: string;
		if (roundingDivisions) {
			jigSpreadOutputValue = decimalToFraction(
				jigSpread,
				roundingDivisions,
				roundMethodSelectList.value as RoundMethod
			);
			fencePositionOutputValue = decimalToFraction(
				fencePosition,
				roundingDivisions,
				roundMethodSelectList.value as RoundMethod
			);
		} else {
			jigSpreadOutputValue = jigSpread.toString();
			fencePositionOutputValue = fencePosition.toString();
		}
		jigSpreadOutputTextInput.value = jigSpreadOutputValue;
		fencePositionOutputTextInput.value = fencePositionOutputValue;
	});