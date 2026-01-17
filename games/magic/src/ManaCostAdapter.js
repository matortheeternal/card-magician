export default function MakeManaCostAdapter(SerializerAdapter, ManaCost) {
    return class ManaCostAdapter extends SerializerAdapter {
        static nodeType = 'ManaCost';

        canEncode(value) {
            return value instanceof ManaCost;
        }

        canDecode(node) {
            return node.__type === ManaCostAdapter.nodeType;
        }

        async encode(manaCost) {
            return {
                __type: ManaCostAdapter.nodeType,
                data: manaCost.toString(true)
            };
        }

        async decode(node) {
            return ManaCost.parse(node.data);
        }
    };
}
