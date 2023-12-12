import React, { useContext, createContext, useEffect, useState, useMemo, useCallback } from 'react';
import { useMediaQuery } from 'react-responsive'
const CardContext = createContext();

export const useCards = () => useContext(CardContext);


export const CardProvider = ({ children }) => {

    const [db, setDb] = useState(false);
    const [addRemoveList, setAddRemoveList] = useState({});

    const [colorFilter, setColorFilter] = useState(
        {
            filterType: "colorIdentity",
            white: true,
            blue: true,
            black: true,
            red: true,
            green: true,
            colorless: false, 
        }
    );
    const [loading, setLoading] = useState(false);
    const [searchToMaybeBoard, setSearchToMaybeBoard] = useState(true);
    const [cmcFilterType, setCmcFilterType] = useState('');
    const [cmcFilter, setCmcFilter] = useState(0);
    const [customSearch, setCustomSearch] = useState('');
    const [cardSearch, setCardSearch] = useState('');
    const [categorySearch, setCategorySearch] = useState('');
    const [showBannedCards, setShowBannedCards] = useState(false);
    const [deckList, setDeckList] = useState([]);

    const isBig = useMediaQuery({query: '(min-width: 2000px)'})
    const isMid = useMediaQuery({query: '(min-width: 1500px)'})
    const isSmall = useMediaQuery({query: '(min-width: 1000px)'})
    const isMidToSmallest = useMediaQuery({query: '(max-width: 1500px)'})
    
    const [page, setPage] = useState(0);
    const [selected, setSelected] = useState("")
    // Fetch Card Databse From API

    useEffect(() => {
        const localDeckList = JSON.parse(localStorage.getItem("deckList"));
        if(localDeckList) 
            setDeckList(localDeckList);
    },[setDeckList])

    useEffect(() => {
        if(deckList.length > 0)
            localStorage.setItem("deckList", JSON.stringify(deckList));
    },[deckList])

    const adjustDbToAddRemovedCard = (db) => (
        db.data.reduce((acc, card) => {
            const numOfCard = (addRemoveList?.[card.oracle_id] ?? (searchToMaybeBoard ? 1 : 0))
            return (numOfCard > 0)
                ? [...acc, {quantity: numOfCard, card: card}]
                : acc
        },[])
    )

    const colorFilterToUriText = useCallback((colorFilter) => (
        (
            colorFilter.white ||
            colorFilter.blue  ||
            colorFilter.black ||
            colorFilter.red   ||
            colorFilter.green ||
            colorFilter.colorless)
                ? ("+" + 
                    (
                        colorFilter.filterType === "colorIdentity"
                            ? "id<%3D"
                            : "c%3D"
                    ) + (
                        colorFilter.colorless
                        ? "C"
                        : "" + 
                        (colorFilter.white ? "W" : "") +
                        (colorFilter.blue  ? "U" : "") +
                        (colorFilter.black ? "B" : "") + 
                        (colorFilter.red   ? "R" : "") +
                        (colorFilter.green ? "G" : "")
                    )
                )
                : ""
    ),[]);

    const addCardToDeckList = (cardWrapper) => {
        if(cardWrapper.quantity > 0)
            setDeckList((prev) => [...prev, cardWrapper])
    };

    const cardObjArrToListString = (cardObjArr) => (
        cardObjArr.map((cardObj) => (
            "" + cardObj.quantity + "x " + 
            ((cardObj?.card?.card_faces ?? false)
                ? cardObj.card.card_faces[0].name + " // " + cardObj.card.card_faces[1].name
                : cardObj.card.name
            )
        ))
    );

    const getNameFromCard = (card) => (
        (card?.card_faces ?? false)
            ? card.card_faces[0].name + " // " + card.card_faces[1].name
            : card.name
    );

    const buildUri = useCallback((rootUri, cardSearch, cmcFilter, cmcFilterType, catagorySearch, showBannedCards, colorFilter, customSearch) => (
        rootUri + 
        "search?order=cmc&q=" + 
                encodeURI(cardSearch) + 
                catagorySearch +
                    (cmcFilterType !== ""
                        ? ("+mv" + cmcFilterType + cmcFilter)
                        : "") + 
                    (showBannedCards ? "" : "+f%3Acommander") + 
                colorFilterToUriText(colorFilter)
    ),[colorFilterToUriText])

    useEffect(() => {
        if(cardSearch !== "" || categorySearch !== "")
            (async () => {
                setLoading(true);
                try {
                    const uri = buildUri("https://api.scryfall.com/cards/", cardSearch, cmcFilter, cmcFilterType, categorySearch, showBannedCards, colorFilter);
                    console.log("uri: " + uri)
                    const res = await fetch(uri);
                    if(res.ok) {
                        const resJson = await res.json();
                        setLoading(false);
                        setDb(resJson);
                    }
                    else { 
                        setDb(false);
                        setLoading(false);
                        throw new Error("Responce not 2xx");
                    }
                } catch (e) {
                    console.log(`Card Not Found (Search: ${cardSearch})`);
                }
            })()
        else
            setDb(false);
    }, [cardSearch, setDb, colorFilterToUriText, colorFilter, cmcFilter, cmcFilterType, showBannedCards, categorySearch, buildUri]);
    
    const colorlessTrueFilter = (filterType) => ({
        filterType: filterType,
        white: false,
        blue: false,
        black: false,
        red: false,
        green: false,
        colorless: true, 
    });

    const setFilterType = (filterType) => {
        if(["colorIdentity", "color"].includes(filterType))
            setColorFilter((prevColorFilter) => ({
                ...prevColorFilter,
                filterType: filterType
            }))
    };

    const setColorOnColorFilter = (color, value) => (
        setColorFilter((prevColorFilter) => 
            color === "colorless" && value
                ? colorlessTrueFilter(prevColorFilter.filterType)
                : ({
                    ...prevColorFilter,
                    [color]: value,
                    colorless: false,
                })
        )
    );

    const removeCardFromDeck = (card) => {
        setDeckList((prev) => prev.filter((c) => c.card.oracle_id !== card.card.oracle_id))
    }

    const combineDuplicates = (cardList) => {
        const uniqueCardGroups = Object.values(Object.groupBy(cardList, ({card}) => card.oracle_id));
        return uniqueCardGroups.flatMap((cardGroup) => 
            cardGroup.length > 1
                ? [{quantity: cardGroup.reduce((acc, cardWrapper) => acc + cardWrapper.quantity, 0), card: cardGroup[0].card}]
                : cardGroup
        );
    }

    const pushSeachListToDeck = () => {
        if (fdb?.data ?? false)
        setDeckList((prev) => [
            ...prev,
            ...adjustDbToAddRemovedCard(fdb),
        ])
    }

    const loadMoreCards = async() => {
        setLoading(true);
        const res = await fetch(db.next_page);
        const json = await res.json();
        setDb({
            ...json,
            data: [...db.data, ...json.data],
        });
        setLoading(false);
    }

    const resetDeckList = useCallback(() => {
        localStorage.setItem("deckList", "[]");
        setDeckList([]);
    }, [setDeckList]);

    const resetAddRemoveList = useCallback(() => {
        setAddRemoveList({});
    }, [setAddRemoveList]);

    // Set FDB
    const fdb = useMemo(() => (db), [db]);

    // Helper Functions
    const changePage = (delta) => {
        const newPage = page + delta;
        if (newPage > Math.ceil((fdb?.length ?? 0) / 9.0) - 1 || newPage < 0) return;
        setPage(newPage);
    };
    
    const value = {
        page,
        fdb,
        db,
        colorFilter,
        isBig, isMid, isSmall,
        isMidToSmallest,
        selected, setSelected, 
        loading, setLoading, 
        deckList, setDeckList,
        cardSearch, setCardSearch,
        cmcFilterType, setCmcFilterType,
        cmcFilter, setCmcFilter,
        customSearch, setCustomSearch,
        showBannedCards, setShowBannedCards,
        categorySearch, setCategorySearch,
        addRemoveList, setAddRemoveList,
        searchToMaybeBoard, setSearchToMaybeBoard,
        changePage, setColorOnColorFilter, 
        setFilterType, adjustDbToAddRemovedCard,
        pushSeachListToDeck, resetDeckList,
        resetAddRemoveList, addCardToDeckList,
        loadMoreCards, cardObjArrToListString,
        getNameFromCard, removeCardFromDeck,
        combineDuplicates,
    };

    return <CardContext.Provider value={value}>{children}</CardContext.Provider>
};