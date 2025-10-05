export default async function(card, utils) {
    card.adventureManaCostHTML = '';
    card.adventureColor = { c: 'c', color: 'colorless' };
    card.rulesTextHTML = '';
    card.adventureTextHTML = '';

     card.addField({
         id: 'rulesText',
         displayName: 'Rules Text'
     });
     card.addField({
         id: 'flavorText',
         displayName: 'Flavor Text',
     });
     card.addField({
         id: 'adventureName',
         displayName: 'Adventure Name',
     });
     card.addField({
         id: 'adventureManaCost',
         displayName: 'Adventure Mana Cost'
     });
     card.addField({
         id: 'adventureSuperType',
         displayName: 'Adventure Super Type',
     });
     card.addField({
         id: 'adventureSubType',
         displayName: 'Adventure Sub Type',
     });
     card.addField({
         id: 'adventureText',
         displayName: 'Adventure Text'
     });

     Alpine.effect(() => {
         if (!card.adventureManaCost) return;
         card.adventureManaCostHTML = card.generateSymbols(card.adventureManaCost, true);
         const colors = card.getColors(card.adventureManaCost);
         card.adventureColor = card.getColorIdentity(colors);
     });

    Alpine.effect(() => {
        if (!card.rulesText) return;
        card.rulesTextHTML = card.formatText(card.rulesText);
    });

    Alpine.effect(() => {
        if (!card.adventureText) return;
        card.adventureTextHTML = card.formatText(card.adventureText);
    });

     card.publishElement('.card-text-box', `
         <div class="adventure-left">
             <div class="adventure-header" x-fit-text="[adventureName, adventureManaCost]">
                 <span class="adventure-name" x-text="adventureName"></span>
                 <span class="adventure-cost mana-cost" x-html="adventureManaCostHTML"></span>
             </div>
             <div class="adventure-type" x-fit-text="[adventureSuperType, adventureSubType]">
                 <span x-text="adventureSuperType"></span>
                 <span x-show="adventureSubType">
                     <span>—</span>
                     <span x-text="adventureSubType"></span>
                 </span>
             </div>
             <div class="adventure-text" x-fit-text="adventureText">
                 <div x-html="adventureTextHTML"></div>
             </div>
         </div>
         <div class="adventure-right" x-fit-text="[rulesText, flavorText]">
             <div class="rules-text" x-html="rulesTextHTML"></div>
             <div class="flavor-text" x-text="flavorText"></div>
         </div>
     `);

     card.addStyle(await utils.loadStyle('style.css'));
 }
