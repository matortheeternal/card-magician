export default function MakeManaCostAdapter(SerializerAdapter, ManaCost) {
    return class ManaCostAdapter extends SerializerAdapter {
        nodeType = 'ManaCost';

        canEncode(value) {
            return value instanceof ManaCost;
        }

        canDecode(node) {
            return node.__type === this.nodeType;
        }

        async encode(manaCost) {
            return {
                __type: this.nodeType,
                data: manaCost.toString(true)
            };
        }

        async decode(node) {
            return ManaCost.parse(node.data);
        }
    }
}
