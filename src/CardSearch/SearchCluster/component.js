import styled from "styled-components";
import { useCards } from "../../contexts/CardContext";
import Select from 'react-select';
import { categoryOptions } from "../categoryOptions";
import QuestonMark from './icons/questionMark.svg';
import { useRef } from "react";
import { Tooltip } from 'react-tooltip';

const Form = styled.form`
    display: flex;
    justify-content: center;
    align-items: center;
`;

const Img = styled.img`
    &:hover{
        padding: 3px;
        background-color: rgba(255, 255, 255, 0.2);
        border-radius: 3px;
    }
    &:active {
        background-color: rgba(255, 255, 255, 0.6);
    }
`;

const Link = styled.a`
    width: 40px;
    height: 40px;
    margin-left: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
`;


const CategorySearch = styled(Select)`
    width: 180px;
    font-size: 1rem;
    color: black;
`;

const Row = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    width: 100%;
    padding: 10px 0 10px 0;
`;

const SmallLabel = styled.label`
    font-size: 1.5rem;
    @media (max-width: 1500px) {
        font-size: 1rem;
    }
`;

const Search = styled.input`
    margin: 0 0 0 20px;
    width: calc(330px - calc(81px + 0.5rem));
    height: 36px;
    padding-left: 0.5rem;
    padding-right: calc(81px + 0.5rem);
    font-size: 1.2rem;
    &::placeholder{
        font-size: 1rem;
    }
`;

const SubmitButton = styled.input`
    margin: 0 20px 0 -81px;
    height: 40px;
    width: 80px;
    border: 0;
    font-size: 1rem;
    border-radius: 3px;
`;

const H3 = styled.h3`
    display: block;
    font-weight: normal;
    font-size: 1.5rem;
    margin: 0;
    padding: 0;
    color: gray;
`;

const Pre = styled.pre`
    background-color: #121010;
    border-radius: 5px;
    padding: 5px 10px;
    margin: 0;
    overflow-x: scroll;
`;


export const SearchClusterWrapper = () => {

    const { db, setCategorySearch, cardSearch, setCardSearch, currentUri, showQuery } = useCards();
    const searchRef = useRef();

    const searchSubmit = (e) => {
        e.preventDefault();
        setCardSearch(searchRef.current.value);
    }

    return <>
        <Row>
            <SmallLabel>{(db?.data?.length ?? 0) + " / " + (db?.total_cards ?? 0)}</SmallLabel>
            <Form onSubmit={searchSubmit}> 
                <Search $custom={false} placeholder="Card Name or Custom Query" ref={searchRef}/>
                <SubmitButton type="submit" value="Search"/>
            </Form>
            <CategorySearch placeholder="Search for Category" onChange={(e) => setCategorySearch(e.value)} options={categoryOptions} />
        </Row>
        {showQuery && <Row>
            <Pre><H3>{
                (currentUri)
                    ? currentUri.substr(currentUri.indexOf("q=")+2)
                    : "Use filters to generate a query"
            }</H3></Pre>
            <Link data-tooltip-id="scryfallHelp" href="https://scryfall.com/docs/syntax" target="_blank"><Img height={40} src={QuestonMark}/></Link>
            <Tooltip id="scryfallHelp" place="top" content="Scryfall Syntax Help" style={{fontSize: "1rem"}} opacity={1}/>
        </Row>}
    </>
}
