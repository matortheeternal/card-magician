const L = localize('extensions');

export default [
    {
        label: L`Type`,
        getValue: details => details.extension.type
    },
    {
        label: L`Author`,
        getValue: details => details.author
    },
    {
        label: L`Game`,
        getValue: details => details.metadata.gameId
    },
    {
        label: L`Installed version`,
        getValue: details => details.installedVersion
    },
    {
        label: L`Available version`,
        getValue: details => details.release?.version ?? L`No compatible release`
    },
    {
        label: L`Download size`,
        getValue: details => details.downloadSize
    }
];
