import React, { useState } from 'react';
import { diffLines } from 'diff';
import { Box, Checkbox, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Label } from '@mui/icons-material';

const DiffPart = styled(Typography)({
    whiteSpace: 'pre-wrap', // Preserve whitespaces and line breaks
    fontFamily: 'monospace', // Optional: Monospace font for code-like appearance
});

const Addition = styled(DiffPart)({
    backgroundColor: '#eaffea',
    color: '#27ae60',
    textDecoration: 'none',
});

const Deletion = styled(DiffPart)({
    backgroundColor: '#ffeef0',
    color: '#c0392b',
    textDecoration: 'line-through',
});

const Unchanged = styled(DiffPart)({});

const PartHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(1),
    backgroundColor: theme.palette.action.hover, // Use a theme color for better integration
}));

type CodeDiffProps = {
    original: string;
    modified: string;
    onGetAppliedChanges: (appliedChanges: string) => void;
}

const CodeDiff = ({ original, modified, onGetAppliedChanges }: CodeDiffProps) => {
    const diffs = diffLines(original, modified);

    // State to track checked status for each diff part
    const [checkedState, setCheckedState] = React.useState(
        Array(diffs.length).fill(false)
    );
    const [selectAllChecked, setSelectAllChecked] = useState(false);

    const [appliedChanges, setAppliedChanges] = useState('');
    

    const handleCheckboxChange = (position: number) => {
        const updatedCheckedState = checkedState.map((item, index) =>
            index === position ? !item : item
        );
        setCheckedState(updatedCheckedState);

        const changesToApply = diffs.map((part, index) => {
            // if part unchangedm then return value
            if(!part.added && !part.removed) {
                return part.value;
            }

            // if part added then return value if checked
            if(part.added && updatedCheckedState[index]) {
                return part.value;
            }

            // if part removed then return value if unchecked
            if(part.removed && !updatedCheckedState[index]) {
                return part.value;
            }

            return '';
        });

        const newAppliedChanges = changesToApply.join('');
        setAppliedChanges(newAppliedChanges);
        console.log('applied changes', newAppliedChanges);
    };

    const handleSelectAllChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newCheckedState = checkedState.map(() => event.target.checked);
        setCheckedState(newCheckedState);
        setSelectAllChecked(event.target.checked);
    };

    return (
        <div>
            <PartHeader>
                <Typography variant="body2">Select All Changes</Typography>
                <Checkbox
                    checked={selectAllChecked}
                    onChange={handleSelectAllChange}
                    color="primary"
                />
            </PartHeader>
            {diffs.map((part, index) => {
             const lineCount = part.count; // Calculate or define part.count as needed
             return (
                 <React.Fragment key={index}>
                     <PartHeader>
                         <Typography variant="body2">{`Lines: ${lineCount}`}</Typography>
                         <Checkbox
                             checked={checkedState[index]}
                             onChange={() => handleCheckboxChange(index)}
                             color="primary"
                         />
                     </PartHeader>
                     {part.added && <Addition>{part.value}</Addition>}
                     {part.removed && <Deletion>{part.value}</Deletion>}
                     {!part.added && !part.removed && <Unchanged>{part.value}</Unchanged>}
                 </React.Fragment>
             );
         })}
     </div>
    );
};

export default CodeDiff;
