import React, { PureComponent } from 'react';

import './stylesheet.css';

import _ from 'lodash';

import TabButtons from '../../../UI/TabButtons';

import { generateTitleLine } from '../../../../lib/export_org';
import { getCurrentTimestampAsText } from '../../../../lib/timestamps';
import { todoKeywordSetForKeyword } from '../../../../lib/org_utils';

export default class TitleEditorModal extends PureComponent {
  constructor(props) {
    super(props);

    _.bindAll(this, [
      'handleTextareaRef',
      'handleTextareaFocus',
      'handleTitleChange',
      'handleTitleFieldClick',
      'handleInsertTimestamp',
      'chooseTodoKeywordSet',
      'handleTodoChange',
      'handleNextTodoKeywordSet',
      'handleNextPrioritySet',
    ]);

    const todoKeywordSet = this.chooseTodoKeywordSet(
      props.todoKeywordSets,
      props.header.getIn(['titleLine', 'todoKeyword'])
    );

    this.state = {
      todoKeywordSet,
      todoKeywordSetIndex: props.todoKeywordSets.indexOf(todoKeywordSet),
      titleValue: props.editRawValues
        ? this.calculateRawTitle(props.header)
        : props.header.getIn(['titleLine', 'rawTitle']),
    };
  }

  handleTextareaRef(textarea) {
    this.textarea = textarea;
  }

  componentDidMount() {
    this.props.setPopupCloseActionValuesAccessor(() => [this.state.titleValue]);
  }

  componentDidUpdate(prevProps) {
    const { header, editRawValues } = this.props;
    if (prevProps.header !== header || prevProps.editRawValues !== editRawValues) {
      this.setState({
        titleValue: editRawValues
          ? this.calculateRawTitle(header)
          : header.getIn(['titleLine', 'rawTitle']),
      });
      this.textarea.focus();
    }
  }

  handleTextareaFocus(event) {
    const { header } = this.props;
    const rawTitle = header.getIn(['titleLine', 'rawTitle']);
    if (rawTitle === '') {
      const text = event.target.value;
      event.target.selectionStart = text.length;
      event.target.selectionEnd = text.length;
    }
  }

  handleTitleChange(event) {
    // If the last character typed was a newline at the end, exit edit mode.
    const newTitle = event.target.value;
    const lastCharacter = newTitle[newTitle.length - 1];
    if (
      this.state.titleValue === newTitle.substring(0, newTitle.length - 1) &&
      lastCharacter === '\n'
    ) {
      this.props.onClose(newTitle);
      return;
    }

    this.setState({ titleValue: newTitle });
  }

  handleTitleFieldClick(event) {
    event.stopPropagation();
  }

  calculateRawTitle(header) {
    return generateTitleLine(header.toJS(), false);
  }

  handleInsertTimestamp(event) {
    const { titleValue } = this.state;
    const insertionIndex = this.textarea.selectionStart;
    this.setState({
      titleValue:
        titleValue.substring(0, insertionIndex) +
        getCurrentTimestampAsText() +
        titleValue.substring(this.textarea.selectionEnd || insertionIndex),
    });

    this.textarea.focus();

    event.stopPropagation();
  }

  chooseTodoKeywordSet(todoKeywordSets, todoKeyword) {
    return todoKeywordSetForKeyword(todoKeywordSets, todoKeyword);
  }

  handleTodoChange(newTodoKeyword) {
    const currentTodoKeyword = this.props.header.getIn(['titleLine', 'todoKeyword']);
    // Unselecting a keyword happens by writing an empty string as
    // keyword. Checking if the newly clicked todo keyword is the same
    // as the currently set todo keyword.
    const keyword = currentTodoKeyword === newTodoKeyword ? '' : newTodoKeyword;
    this.props.saveTitle(this.state.titleValue);
    this.props.onTodoClicked(keyword);
  }

  handleNextTodoKeywordSet() {
    const { todoKeywordSets } = this.props;
    const newIndex =
      this.state.todoKeywordSetIndex + 1 !== todoKeywordSets.size
        ? this.state.todoKeywordSetIndex + 1
        : 0;
    const newTodoKeywordSet =
      newIndex !== todoKeywordSets.size ? todoKeywordSets.get(newIndex) : todoKeywordSets.get(0);
    this.setState({
      todoKeywordSet: newTodoKeywordSet,
      todoKeywordSetIndex: newIndex,
    });
  }

  handleNextPrioritySet(priority) {
    this.props.priorityChanged(priority)
  }

  render() {
    const currentPriority = this.props.header.getIn(['titleLine', 'priority'])
    return (
      <>
        <h2 className="drawer-modal__title">
          {this.props.editRawValues ? 'Edit full title' : 'Edit title'}
        </h2>

        {this.props.editRawValues ? null : (
          <div>
            <TabButtons
              buttons={this.state.todoKeywordSet
                .get('keywords')
                }
              selectedButton={this.props.header.getIn(['titleLine', 'todoKeyword'])}
              onSelect={this.handleTodoChange}
            />

            {this.props.todoKeywordSets.size > 1 ? (
              <button
                className="btn-passive"
                onClick={this.handleNextTodoKeywordSet}
                title="Next keyword set"
              >
                Next set
              </button>
            ) : null}
          </div>
        )}

        {this.props.editRawValues ? null : (
          <div style={{display: "flex", margin: "15px 0px", justifyContent: "flex-start", gap: "15px", flexWrap: "wrap"}}>
            {/*<div style={{alignSelf: "center"}}><i className={"fas fa-lg fa-circle-exclamation"}/></div>*/}
            {["[#A]", "[#B]", "[#C]"].map(priority =>
              (<div style={{
                border: "1px solid",
                padding: "5px",
                // borderRadius: "20%",
                borderRadius: ".25rem",
                alignSelf: "center",
                fontSize: "10px",
                color: priority === currentPriority ? "var(--orange)": ""
              }} key={priority} onClick={this.handleNextPrioritySet.bind(this, priority)}>{priority}</div>)
            )}
          </div>
        )}

        <div className="title-line__edit-container">
          <textarea
            autoFocus
            className="textarea drag-handle textarea-title"
            data-testid="titleLineInput"
            rows="3"
            ref={this.handleTextareaRef}
            value={this.state.titleValue}
            onFocus={this.handleTextareaFocus}
            onChange={this.handleTitleChange}
            onClick={this.handleTitleFieldClick}
          />
          <div className="title-line__insert-timestamp-button" onClick={this.handleInsertTimestamp}>
            <i className="fas fa-plus insert-timestamp-icon" />
            Insert timestamp
          </div>
        </div>
      </>
    );
  }
}
