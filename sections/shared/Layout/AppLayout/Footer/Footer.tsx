import { FC } from 'react';
import styled from 'styled-components';

const Footer: FC = () => {
    const gitID = process.env.GIT_HASH_ID!.toString();

    return (
        <GitIDFooter>
            {gitID}
        </GitIDFooter>
    );
};

const GitIDFooter = styled.div`
	font-family: Akkurat LL TT;
    font-style: normal;
    font-weight: normal;
    font-size: 10px;
    line-height: 140%;
    /* identical to box height, or 14px */
    
    display: flex;
    justify-items: center;
    position: absolute;
    bottom: 0px;
    display: grid;
    width: 100%;
    margin-bottom: 5px;
    
    color: #2B3035;
`;

export default Footer;
