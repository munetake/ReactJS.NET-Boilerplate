var Comment = React.createClass({
    rawMarkup: function() {
        var md = new Remarkable();
        var rawMarkup = md.render(this.props.children.toString());
        return { __html: rawMarkup }
    },

    render: function () {
        var md = new Remarkable();
        return (
            <div className="comment">
                <h2 className="commentAuthor">
                    { this.props.author}
                </h2>
                <span dangerouslySetInnerHTML={ this.rawMarkup() } />
            </div>
        );
    }
});

var CommentList = React.createClass({
    render: function () {
        var commentNodes = this.props.data.map(function (comment) {
            return (
                <Comment author={ comment.author} key={comment.id }>
                    { comment.text}
                </Comment>
            );
        });
        return (
            <div className="commentList">
                {commentNodes}
            </div>
        );
    }
});

var CommentForm = React.createClass({
    getInitialState: function() {
        return {
            author: "",
            text: ""
        };
    },
    handleTextChange: function(e) {
        var newState = {};
        newState[e.target.name] = e.target.value;
        this.setState(newState);
    },
    handleSubmit: function(e) {
        e.preventDefault();
        var author = this.state.author.trim();
        var text = this.state.text.trim();
        if (!text || !author) {
            return;
        }
        // TODO: Send request to the server here. 
        this.props.onCommentSubmit({
            author: author,
            text: text
        });
        this.setState({
            author: "",
            text: ""
        });
    },
    render: function () {
        return (
            <form className="commentForm">
                <input name="author" type="text" value={this.state.author} onChange={this.handleTextChange} placeholder="Your name..." />
                <input name="text" type="text" value={this.state.text} onChange={this.handleTextChange} placeholder="Say something..." />
                <input type="submit" value="Post" />
            </form>
        );
    }
});

var CommentBox = React.createClass({
    getInitialState: function() {
        return {
            data: []
        };
    },
    loadCommentsFromServer: function() {
        var xhr = new XMLHttpRequest();
        xhr.open("get", this.props.url, true);
        xhr.onload = function () {
            var data = JSON.parse(xhr.responseText);
            this.setState({ data: data });
        }.bind(this);
        xhr.send();
    },
    handleCommentSubmit: function(comment) {
        var data = new FormData();
        data.append("author", comment.author);
        data.append("text", comment.text);

        var xhr = new XMLHttpRequest();
        xhr.open("post", this.props.submitUrl, true);
        xhr.onload = function () {
            this.loadCommentsFromServer();
        }.bind(this);
        xhr.send(data);
    },
    componentDidMount: function() {
        this.loadCommentsFromServer();
        window.setInterval(this.loadCommentsFromServer, this.props.pollInterval);
    },
    render: function() {
        return (
            <div className="commentBox">
                <h1>Comments</h1>
                <CommentList data={ this.state.data }/>
                <CommentForm onCommentSubmit={ this.handleCommentSubmit } />
            </div>
        );
    }
});

// In a real app, the URL "/comments" should be generated server-side via a Url.Action call
// Alternatively, RouteJS (http://dan.cx/projects/routejs) could be used.
ReactDOM.render(
    <CommentBox url="/comments" submitUrl="/comments/new" pollInterval={2000} />,
    document.getElementById("content")
);