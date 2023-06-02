export function notNill<Value>(value: Value | null | undefined): value is Value {
	return !!value;
}
